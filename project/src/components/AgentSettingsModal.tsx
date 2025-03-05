import copy from 'copy-to-clipboard';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Ban, Check, Copy, Key, Link, MessageSquare, QrCode, RefreshCw, Save, User, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { QRCodeSVG } from 'qrcode.react';
import React, { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useChatStore } from '../store/chatStore';
import { useLicenseStore } from '../store/licenseStore';

interface AgentSettingsModalProps {
  onClose: () => void;
  onUpdateProfile: (name: string, avatar?: string) => void;
  initialName: string;
  initialAvatar?: string;
  licenseKey: string;
}

export const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({
  onClose,
  onUpdateProfile,
  initialName,
  initialAvatar,
  licenseKey
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(initialName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarScale, setAvatarScale] = useState(1);
  const [quickReplyTitle, setQuickReplyTitle] = useState('');
  const [quickReplyContent, setQuickReplyContent] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareToken, setShareToken] = useState(nanoid());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChangingLicense, setIsChangingLicense] = useState(false);
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [licenseError, setLicenseError] = useState('');

  const avatarEditorRef = useRef<AvatarEditor>(null);

  const {
    addQuickReply,
    removeQuickReply,
    updateWelcomeMessage,
    blockedUsers,
    unblockUser,
    agentSettings,
    currentAgent
  } = useChatStore();

  const { isLicenseValid, activateLicense, getLicenseExpiry } = useLicenseStore();

  const getAgentShortLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/chat?agent=${agentSettings?.id || ''}&token=${shareToken}`;
  };

  const handleSaveProfile = () => {
    if (avatarEditorRef.current && avatarFile) {
      const canvas = avatarEditorRef.current.getImageScaledToCanvas();
      const dataUrl = canvas.toDataURL();
      onUpdateProfile(name, dataUrl);
    } else {
      onUpdateProfile(name, initialAvatar);
    }
    onClose();
  };

  const handleAddQuickReply = () => {
    if (quickReplyTitle.trim() && quickReplyContent.trim()) {
      addQuickReply(quickReplyTitle, quickReplyContent);
      setQuickReplyTitle('');
      setQuickReplyContent('');
    }
  };

  const handleSaveWelcomeMessage = () => {
    if (welcomeMessage.trim()) {
      updateWelcomeMessage(welcomeMessage);
      alert('欢迎消息更新成功！');
    }
  };

  const handleUnblockUser = (userId: string) => {
    if (window.confirm('确定要解除对此用户的拉黑吗？')) {
      unblockUser(userId);
    }
  };

  const handleCopyLink = () => {
    const link = getAgentShortLink();
    copy(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRefreshShare = () => {
    setIsRefreshing(true);
    setShareToken(nanoid());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleChangeLicense = async () => {
    if (!newLicenseKey.trim() || newLicenseKey.length !== 16) {
      setLicenseError('无效的许可密钥格式');
      return;
    }

    if (!isLicenseValid(newLicenseKey)) {
      setLicenseError('许可密钥无效或已过期');
      return;
    }

    try {
      const activated = await activateLicense(newLicenseKey, currentAgent?.id || '');
      if (activated) {
        setIsChangingLicense(false);
        setNewLicenseKey('');
        setLicenseError('');
        window.location.reload();
      } else {
        setLicenseError('密钥激活失败，可能已被其他客服使用');
      }
    } catch {
      setLicenseError('更换密钥时发生错误');
    }
  };

  const expiryDate = getLicenseExpiry(licenseKey);
  const timeRemaining = expiryDate ? formatDistanceToNow(expiryDate, { locale: zhCN, addSuffix: true }) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">客服设置</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-gray-100 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left p-2 rounded flex items-center space-x-2 ${
                activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
              }`}
            >
              <User className="h-5 w-5" />
              <span>个人资料</span>
            </button>
            <button
              onClick={() => setActiveTab('quickReplies')}
              className={`w-full text-left p-2 rounded flex items-center space-x-2 ${
                activeTab === 'quickReplies' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>快捷回复</span>
            </button>
            <button
              onClick={() => setActiveTab('welcome')}
              className={`w-full text-left p-2 rounded flex items-center space-x-2 ${
                activeTab === 'welcome' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>欢迎消息</span>
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`w-full text-left p-2 rounded flex items-center space-x-2 ${
                activeTab === 'share' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
              }`}
            >
              <QrCode className="h-5 w-5" />
              <span>分享链接</span>
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`w-full text-left p-2 rounded flex items-center space-x-2 ${
                activeTab === 'blocked' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
              }`}
            >
              <Ban className="h-5 w-5" />
              <span>已拉黑用户</span>
            </button>
            <button
              onClick={() => setActiveTab('license')}
              className={`w-full text-left p-2 rounded flex items-center space-x-2 ${
                activeTab === 'license' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
              }`}
            >
              <Key className="h-5 w-5" />
              <span>许可证</span>
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium mb-4">个人资料设置</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    客服名称
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    头像
                  </label>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {avatarFile ? (
                        <AvatarEditor
                          ref={avatarEditorRef}
                          image={avatarFile}
                          width={150}
                          height={150}
                          border={10}
                          borderRadius={75}
                          color={[255, 255, 255, 0.6]}
                          scale={avatarScale}
                          rotate={0}
                        />
                      ) : initialAvatar ? (
                        <img
                          src={initialAvatar}
                          alt="当前头像"
                          className="w-[150px] h-[150px] rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-[150px] h-[150px] rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          上传新图片
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAvatarFile(e.target.files[0]);
                            }
                          }}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </div>

                      {avatarFile && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            缩放
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="2"
                            step="0.01"
                            value={avatarScale}
                            onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>保存资料</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'quickReplies' && (
              <div>
                <h3 className="text-lg font-medium mb-4">快捷回复</h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium mb-2">添加新的快捷回复</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标题
                    </label>
                    <input
                      type="text"
                      value={quickReplyTitle}
                      onChange={(e) => setQuickReplyTitle(e.target.value)}
                      placeholder="例如：问候语"
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      消息内容
                    </label>
                    <textarea
                      value={quickReplyContent}
                      onChange={(e) => setQuickReplyContent(e.target.value)}
                      placeholder="输入您的消息模板..."
                      rows={3}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddQuickReply}
                    disabled={!quickReplyTitle.trim() || !quickReplyContent.trim()}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    添加快捷回复
                  </button>
                </div>

                <h4 className="font-medium mb-2">您的快捷回复</h4>
                {agentSettings?.quickReplies && agentSettings.quickReplies.length > 0 ? (
                  <div className="space-y-2">
                    {agentSettings.quickReplies.map(qr => (
                      <div key={qr.id} className="bg-white border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium">{qr.title}</h5>
                          <button
                            onClick={() => removeQuickReply(qr.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{qr.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">暂无快捷回复。</p>
                )}
              </div>
            )}

            {activeTab === 'welcome' && (
              <div>
                <h3 className="text-lg font-medium mb-4">欢迎消息</h3>
                <p className="text-gray-600 mb-4">
                  当您接受新的聊天时，此消息将自动发送。
                </p>

                <div className="mb-4">
                  <textarea
                    value={welcomeMessage || agentSettings?.welcomeMessage || '您好！我能为您提供什么帮助？'}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={5}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSaveWelcomeMessage}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>保存欢迎消息</span>
                </button>
              </div>
            )}

            {activeTab === 'share' && (
              <div>
                <h3 className="text-lg font-medium mb-4">分享链接</h3>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    生成您的专属客服链接和二维码，方便用户快速找到您。
                  </p>
                  <button
                    onClick={handleRefreshShare}
                    disabled={isRefreshing}
                    className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-all ${isRefreshing ? 'opacity-50' : ''}`}
                  >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>刷新链接</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 border rounded-lg">
                    <h4 className="font-medium mb-4 flex items-center">
                      <QrCode className="h-5 w-5 mr-2" />
                      二维码
                    </h4>
                    <div className="flex justify-center mb-4">
                      <QRCodeSVG
                        value={getAgentShortLink()}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      扫描二维码即可开始对话
                    </p>
                  </div>

                  <div className="bg-white p-6 border rounded-lg">
                    <h4 className="font-medium mb-4 flex items-center">
                      <Link className="h-5 w-5 mr-2" />
                      短链接
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 break-all">
                      <code className="text-sm">{getAgentShortLink()}</code>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-5 w-5" />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5" />
                          <span>复制链接</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'blocked' && (
              <div>
                <h3 className="text-lg font-medium mb-4">已拉黑用户</h3>

                {blockedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {blockedUsers.map(userId => (
                      <div key={userId} className="bg-white border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium">用户ID: </span>
                          <span className="text-gray-600">{userId}</span>
                        </div>
                        <button
                          onClick={() => handleUnblockUser(userId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          解除拉黑
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">没有已拉黑的用户。</p>
                )}
              </div>
            )}

            {activeTab === 'license' && (
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">许可证管理</h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">当前许可密钥</p>
                      <p className="font-mono mt-1">{licenseKey}</p>
                    </div>
                    {timeRemaining && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">有效期</p>
                        <p className="text-sm font-medium text-orange-600">{timeRemaining}</p>
                      </div>
                    )}
                  </div>
                </div>

                {!isChangingLicense ? (
                  <button
                    onClick={() => setIsChangingLicense(true)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <Key className="h-4 w-4" />
                    <span>更换许可密钥</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        新许可密钥
                      </label>
                      <input
                        type="text"
                        value={newLicenseKey}
                        onChange={(e) => setNewLicenseKey(e.target.value)}
                        placeholder="请输入新的许可密钥"
                        className="w-full p-2 border rounded-md"
                      />
                      {licenseError && (
                        <p className="text-red-500 text-sm mt-1">{licenseError}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleChangeLicense}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        确认更换
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingLicense(false);
                          setNewLicenseKey('');
                          setLicenseError('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
