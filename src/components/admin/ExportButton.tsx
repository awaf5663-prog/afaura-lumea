import { useRef, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Sheet } from '@/src/components/ui/Sheet';

/**
 * Export vers un tableur.
 *
 * Le site reste la source de vérité : le fichier sert à compter, archiver ou
 * imprimer dans Excel ou Google Sheets, jamais à ressaisir les commandes.
 *
 * Deux chemins volontairement, parce qu'un seul ne marche pas partout : le
 * téléchargement sur le site publié, et le tableau affiché en clair, à copier
 * puis coller dans le tableur. Certains contextes — l'aperçu Claude entre
 * autres — bloquent tout téléchargement lancé par la page ; le bouton serait
 * alors mort sans que rien ne l'explique.
 */
export function ExportButton({
  label,
  build,
}: {
  label: string;
  build: () => { filename: string; content: string };
}) {
  const [file, setFile] = useState<{ filename: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  const copy = async () => {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
    } catch {
      // Presse-papiers refusé : on sélectionne le texte, la cliente copie
      // elle-même avec le menu de son téléphone.
      areaRef.current?.focus();
      areaRef.current?.select();
    }
    window.setTimeout(() => setCopied(false), 2000);
  };

  const save = () => {
    if (!file) return;
    const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setFile(build())}
        className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-graphite"
      >
        <Download className="size-3.5" />
        {label}
      </button>

      <Sheet open={file !== null} onClose={() => setFile(null)} title="Exporter vers Excel" side="bottom">
        <p className="text-[13px] leading-relaxed text-stone">
          Deux façons de récupérer le tableau. Sur le site publié, le bouton télécharge le fichier{' '}
          <code className="break-all text-[12px]">{file?.filename}</code> : il s'ouvre directement
          dans Excel ou Google Sheets. Depuis l'aperçu, les téléchargements sont bloqués — copiez le
          tableau ci-dessous et collez-le dans une feuille vide.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-medium text-ivory"
          >
            <Download className="size-3.5" />
            Télécharger le fichier
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-graphite"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copié' : 'Copier le tableau'}
          </button>
        </div>

        <textarea
          ref={areaRef}
          readOnly
          value={file?.content ?? ''}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-4 h-64 w-full rounded-[--radius-sm] border border-line bg-white p-3 font-mono text-[11px] leading-relaxed text-graphite"
        />

        <p className="mt-3 text-[12px] leading-relaxed text-stone">
          Les colonnes sont séparées par des points-virgules, comme Excel en français les attend. Si
          tout arrive dans une seule colonne, utilisez Données → Convertir, et choisissez le
          point-virgule.
        </p>
      </Sheet>
    </>
  );
}
