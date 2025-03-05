declare module 'react-avatar-editor' {
  import { Component } from 'react';

  export interface AvatarEditorProps {
    image: string | File;
    width?: number;
    height?: number;
    border?: number;
    borderRadius?: number;
    color?: number[];
    scale?: number;
    rotate?: number;
    position?: { x: number; y: number };
    onPositionChange?: (position: { x: number; y: number }) => void;
    onLoadSuccess?: (imgInfo: { width: number; height: number }) => void;
    onLoadFailure?: (error: Error) => void;
    onImageReady?: () => void;
    onMouseUp?: () => void;
    onMouseMove?: () => void;
    disableBoundaryChecks?: boolean;
    crossOrigin?: string;
  }

  export default class AvatarEditor extends Component<AvatarEditorProps> {
    getImage(): HTMLCanvasElement;
    getImageScaledToCanvas(): HTMLCanvasElement;
  }
}
