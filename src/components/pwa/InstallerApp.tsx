import { Download, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  dejaInstalle,
  estIOS,
  installer,
  installationPossible,
  surChangement,
} from '@/src/lib/installation';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';

/**
 * « Installer l'application » — sans store, sans frais.
 *
 * Le site s'installe depuis le navigateur : une icône sur l'écran d'accueil,
 * l'ouverture en plein écran, et les mises à jour qui arrivent toutes seules.
 *
 * Discret par principe : la carte ne s'affiche qu'à l'accueil, disparaît dès
 * que le site est installé, et ne revient plus si la cliente l'a écartée. Une
 * invitation qui insiste fait fuir plus qu'elle ne convertit.
 */
export function InstallerApp() {
  const [ecarte, setEcarte] = useState(() =>
    readJson<boolean>(STORAGE_KEYS.installationEcartee, false),
  );
  const [possible, setPossible] = useState(installationPossible);
  const [installe, setInstalle] = useState(dejaInstalle);

  useEffect(() => {
    const desabonner = surChangement(() => {
      setPossible(installationPossible());
      setInstalle(dejaInstalle());
    });
    return desabonner;
  }, []);

  const ios = estIOS();

  // Rien à proposer : déjà installé, écarté, ou navigateur qui ne sait pas le
  // faire (un ordinateur de bureau, par exemple).
  if (installe || ecarte || (!possible && !ios)) return null;

  const ecarter = () => {
    setEcarte(true);
    writeJson(STORAGE_KEYS.installationEcartee, true);
  };

  return (
    <section className="container-page pb-4">
      <div className="relative overflow-hidden rounded-[--radius-lg] border border-line bg-white px-5 py-4">
        <button
          type="button"
          aria-label="Masquer cette proposition"
          onClick={ecarter}
          className="press absolute right-3 top-3 grid size-8 place-items-center rounded-full text-stone"
        >
          <X className="size-4" />
        </button>

        <p className="flex items-center gap-2 pr-8 text-[15px] font-medium">
          <Download className="size-4 text-mauve" strokeWidth={1.8} /> Gardez Afaura Luméa sur
          votre écran d'accueil
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
          Une icône comme une application, l'ouverture en plein écran, et rien à télécharger
          depuis un store.
        </p>

        {ios ? (
          /*
           * iPhone n'autorise aucune installation automatique : on décrit le
           * geste plutôt que de promettre un bouton qui ne ferait rien.
           */
          <p className="mt-3 flex flex-wrap items-center gap-1.5 rounded-[--radius-sm] bg-cream/70 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-graphite">
            Appuyez sur
            <Share className="size-3.5 shrink-0 text-mauve" strokeWidth={1.8} />
            <span className="font-medium">Partager</span>
            en bas de Safari, puis
            <span className="font-medium">« Sur l'écran d'accueil »</span>.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              void installer().then((accepte) => {
                if (accepte) setInstalle(true);
              });
            }}
            className="press mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13.5px] text-ivory"
          >
            <Download className="size-4" strokeWidth={1.8} /> Installer
          </button>
        )}
      </div>
    </section>
  );
}
