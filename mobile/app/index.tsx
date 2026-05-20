import { Redirect } from 'expo-router';
import { useAuth } from '@/store/auth';

export default function Index() {
  const { user, hydrated } = useAuth();
  if (!hydrated) return null;
  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}
