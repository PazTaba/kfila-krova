// backgroundLocation.ts
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { updateUserLocation } from './updateUserLocation';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async () => {
  try {
    console.log('🛰️ Running background location update...');
    await updateUserLocation();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ Error in background task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const startBackgroundLocationUpdates = async () => {
  const status = await BackgroundFetch.getStatusAsync();

  if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
    console.warn('⚠️ Background fetch is not available');
    return;
  }

  const tasks = await TaskManager.getRegisteredTasksAsync();
  const alreadyRegistered = tasks.some(task => task.taskName === LOCATION_TASK_NAME);

  if (!alreadyRegistered) {
    await BackgroundFetch.registerTaskAsync(LOCATION_TASK_NAME, {
      minimumInterval: 60 * 3, // כל 3 דקות
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('✅ Background location task registered');
  } else {
    console.log('ℹ️ Background location task already registered');
  }
};
