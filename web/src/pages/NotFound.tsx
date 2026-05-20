import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex items-center justify-center px-5">
      <div className="text-center">
        <div className="text-6xl font-bold gradient-text">404</div>
        <div className="mt-2 text-lg text-muted">This page wandered off.</div>
        <Link to="/" className="mt-6 inline-block"><Button>Back to home</Button></Link>
      </div>
    </div>
  );
}
