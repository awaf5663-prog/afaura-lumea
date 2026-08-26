import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/cn';

interface Props {
  /** Ce qui est protégé. Affiché dans le message : « l'onglet Groupages ». */
  label: string;
  /** Mise en page du message d'erreur (marges de la zone remplacée). */
  className?: string;
  children: ReactNode;
}

interface State {
  message: string | null;
}

/**
 * Filet de sécurité d'affichage.
 *
 * Sans lui, une erreur pendant le rendu vide toute la page : l'écran devient
 * ivoire et rien n'explique pourquoi. Ici l'erreur reste enfermée dans la
 * zone concernée, le reste de l'administration continue de fonctionner, et
 * le message technique est affiché tel quel — c'est lui qui permet de
 * comprendre le problème sans avoir à deviner.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Afaura Luméa]', this.props.label, error, info.componentStack);
  }

  render() {
    if (this.state.message === null) return this.props.children;
    return (
      <div className={cn('rounded-[--radius-lg] border border-blush bg-white p-6', this.props.className)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-mauve" />
          <div className="min-w-0">
            <h2 className="text-[18px]">Cette partie n'a pas pu s'afficher</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-graphite">
              Une erreur est survenue dans {this.props.label}. Le reste de l'administration
              fonctionne normalement : vous pouvez changer d'onglet. Rien n'a été modifié ni
              perdu.
            </p>
            <p className="mt-3 break-words rounded-[--radius-md] bg-ivory px-3 py-2 font-mono text-[12px] text-stone">
              {this.state.message}
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => this.setState({ message: null })}>
                Réessayer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
                Recharger la page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
