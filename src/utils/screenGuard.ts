import ScreenGuardModule from 'react-native-screenguard';

let activated = false;

export const initAndActivateScreenGuard = async (): Promise<void> => {
  if (activated) {
    return;
  }
  try {
    await ScreenGuardModule.initSettings({
      enableCapture: false,
      enableRecord: false,
      enableContentMultitask: false,
      displayScreenGuardOverlay: true,
      displayScreenguardOverlayAndroid: true,
      timeAfterResume: 0,
    });
    await ScreenGuardModule.registerWithBlurView({ radius: 35 });
    activated = true;
  } catch (e) {
    console.warn('ScreenGuard failed to activate — native module not linked?', e);
  }
};
