import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  platformName: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      width: 1200,
      height: 800,
      orientation: 'landscape',
      platformName: 'Desktop',
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUA = /iPad|Tablet/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let deviceType: DeviceType = 'desktop';
  if (width < 768 || isMobileUA) {
    deviceType = 'mobile';
  } else if ((width >= 768 && width < 1024) || isTabletUA) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  let platformName = 'Desktop Browser';
  if (/iPhone|iPod/i.test(ua)) platformName = 'Apple iPhone';
  else if (/iPad/i.test(ua)) platformName = 'Apple iPad';
  else if (/Android/i.test(ua)) platformName = isTabletUA ? 'Android Tablet' : 'Android Smartphone';
  else if (/Macintosh|Mac OS/i.test(ua)) platformName = 'macOS';
  else if (/Windows/i.test(ua)) platformName = 'Windows PC';

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isTouch,
    width,
    height,
    orientation: width > height ? 'landscape' : 'portrait',
    platformName,
  };
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(detectDevice);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}
