export interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

export interface PinchGestureConfig {
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  onZoomIn?: (scale: number) => void;
  onZoomOut?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

export interface TapGestureConfig {
  onSingleTap?: (event: TouchEvent) => void;
  onDoubleTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  doubleTapDelay?: number;
  longPressDelay?: number;
}

export class SwipeGestureHandler {
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private config: SwipeGestureConfig;

  constructor(config: SwipeGestureConfig) {
    this.config = {
      minSwipeDistance: 50,
      maxSwipeTime: 1000,
      ...config
    };
  }

  handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();
    }
  };

  handleTouchEnd = (event: TouchEvent) => {
    if (event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;
      const deltaTime = touchEndTime - this.touchStartTime;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check if it's a valid swipe
      if (
        deltaTime <= this.config.maxSwipeTime! &&
        (absDeltaX >= this.config.minSwipeDistance! || absDeltaY >= this.config.minSwipeDistance!)
      ) {
        // Determine swipe direction
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && this.config.onSwipeRight) {
            this.config.onSwipeRight();
          } else if (deltaX < 0 && this.config.onSwipeLeft) {
            this.config.onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && this.config.onSwipeDown) {
            this.config.onSwipeDown();
          } else if (deltaY < 0 && this.config.onSwipeUp) {
            this.config.onSwipeUp();
          }
        }
      }
    }
  };

  destroy() {
    // Cleanup if needed
  }
}

export class PinchGestureHandler {
  private initialDistance: number = 0;
  private lastScale: number = 1;
  private config: PinchGestureConfig;

  constructor(config: PinchGestureConfig) {
    this.config = {
      minScale: 0.5,
      maxScale: 3,
      ...config
    };
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      this.initialDistance = this.getDistance(event.touches[0], event.touches[1]);
      this.config.onPinchStart?.();
      event.preventDefault();
    }
  };

  handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 2 && this.initialDistance > 0) {
      const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / this.initialDistance;
      
      if (scale !== this.lastScale) {
        const clampedScale = Math.max(this.config.minScale!, Math.min(this.config.maxScale!, scale));
        
        if (clampedScale > this.lastScale && this.config.onZoomIn) {
          this.config.onZoomIn(clampedScale);
        } else if (clampedScale < this.lastScale && this.config.onZoomOut) {
          this.config.onZoomOut(clampedScale);
        }
        
        this.lastScale = clampedScale;
      }
      
      event.preventDefault();
    }
  };

  handleTouchEnd = (event: TouchEvent) => {
    if (event.touches.length < 2) {
      this.initialDistance = 0;
      this.lastScale = 1;
      this.config.onPinchEnd?.();
    }
  };

  destroy() {
    // Cleanup if needed
  }
}

export class TapGestureHandler {
  private tapTimeout: NodeJS.Timeout | null = null;
  private longPressTimeout: NodeJS.Timeout | null = null;
  private tapCount: number = 0;
  private config: TapGestureConfig;

  constructor(config: TapGestureConfig) {
    this.config = {
      doubleTapDelay: 300,
      longPressDelay: 500,
      ...config
    };
  }

  handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      // Start long press timer
      this.longPressTimeout = setTimeout(() => {
        this.config.onLongPress?.(event);
        this.tapCount = 0; // Reset tap count on long press
      }, this.config.longPressDelay);
    }
  };

  handleTouchEnd = (event: TouchEvent) => {
    if (event.changedTouches.length === 1) {
      // Clear long press timer
      if (this.longPressTimeout) {
        clearTimeout(this.longPressTimeout);
        this.longPressTimeout = null;
      }

      this.tapCount++;

      if (this.tapCount === 1) {
        // Wait for potential second tap
        this.tapTimeout = setTimeout(() => {
          this.config.onSingleTap?.(event);
          this.tapCount = 0;
        }, this.config.doubleTapDelay);
      } else if (this.tapCount === 2) {
        // Double tap detected
        if (this.tapTimeout) {
          clearTimeout(this.tapTimeout);
          this.tapTimeout = null;
        }
        this.config.onDoubleTap?.(event);
        this.tapCount = 0;
      }
    }
  };

  handleTouchMove = () => {
    // Cancel long press on move
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  };

  destroy() {
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
    }
  }
}

// Hook for easier React integration
export const useSwipeGesture = (config: SwipeGestureConfig) => {
  const handler = new SwipeGestureHandler(config);
  
  return {
    onTouchStart: handler.handleTouchStart,
    onTouchEnd: handler.handleTouchEnd,
  };
};

export const usePinchGesture = (config: PinchGestureConfig) => {
  const handler = new PinchGestureHandler(config);
  
  return {
    onTouchStart: handler.handleTouchStart,
    onTouchMove: handler.handleTouchMove,
    onTouchEnd: handler.handleTouchEnd,
  };
};

export const useTapGesture = (config: TapGestureConfig) => {
  const handler = new TapGestureHandler(config);
  
  return {
    onTouchStart: handler.handleTouchStart,
    onTouchMove: handler.handleTouchMove,
    onTouchEnd: handler.handleTouchEnd,
  };
};

// Utility functions
export const vibrate = (pattern: number | number[] = 50) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      return wakeLock;
    } catch (err) {
      console.log('Wake lock failed:', err);
      return null;
    }
  }
  return null;
};

export const shareContent = async (data: { title: string; text?: string; url?: string }) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.log('Share canceled or failed:', error);
      return false;
    }
  } else if (navigator.clipboard && data.url) {
    try {
      await navigator.clipboard.writeText(`${data.title}: ${data.url}`);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  return false;
}; 