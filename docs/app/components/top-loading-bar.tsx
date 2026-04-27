import { useEffect, useRef } from 'react';
import { useNavigation } from 'react-router';
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar';

export function TopLoadingBar() {
  const ref = useRef<LoadingBarRef>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === 'idle') {
      ref.current?.complete();
    } else {
      ref.current?.continuousStart();
    }
  }, [navigation.state]);

  return (
    <LoadingBar
      ref={ref}
      color="#00DDFF"
      height={2}
      shadow={false}
      waitingTime={120}
    />
  );
}
