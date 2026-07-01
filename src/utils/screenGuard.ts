import ScreenGuardModule from 'react-native-screenguard';

export const initScreenGuard = async (): Promise<void> => {
  await ScreenGuardModule.initSettings({
    displayScreenGuardOverlay: true,
    timeAfterResume: 2000,
  });
};

export const activateScreenGuard = async (blurRadius = 35): Promise<void> => {
  await ScreenGuardModule.registerWithBlurView({ radius: blurRadius });
};

export const deactivateScreenGuard = async (): Promise<void> => {
  await ScreenGuardModule.unregister();
};
