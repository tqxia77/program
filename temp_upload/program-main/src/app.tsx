import { PropsWithChildren } from 'react';
import { LucideTaroProvider } from 'lucide-react-taro';
import '@/app.css';
import { Toaster } from '@/components/ui/toast';
import { Preset } from './presets';
import { FontModeProvider } from './store/font-mode';

const App = ({ children }: PropsWithChildren) => {
  return (
    <FontModeProvider>
      <LucideTaroProvider defaultColor="#000" defaultSize={24}>
        <Preset>{children}</Preset>
        <Toaster />
      </LucideTaroProvider>
    </FontModeProvider>
  );
};

export default App;
