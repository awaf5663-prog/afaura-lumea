import { useEffect } from "react";
import {
  BRAND,
  WHATSAPP_LINK,
  WHATSAPP_NUMBER,
  INSTAGRAM_HANDLE,
} from "@/src/config/site";

/**
 * ─────────────────────────────────────────────────────────────
 *  LA BOUTIQUE EST EN PAUSE
 * ─────────────────────────────────────────────────────────────
 *  Ce qu'une cliente doit comprendre en trois secondes : la boutique
 *  existe, elle revient, et on peut commander tout de suite par message.
 *
 *  CE QU'ON NE DIT PAS. Aucune date de retour : on n'en connaît pas, et
 *  une date annoncée puis manquée coûte plus cher que pas de date du
 *  tout. Aucune panne non plus — « nous rencontrons un incident » fait
 *  douter d'une boutique qu'on ne connaît pas encore.
 *
 *  ET SURTOUT, LE WHATSAPP RESTE. Une boutique en pause qui ne laisse
 *  aucun moyen de commander perd la vente ET la cliente. Celle qui
 *  répond dans la minute n'en perd aucune des deux : c'est ainsi que la
 *  boutique vendait avant d'avoir un site.
 *
 *  Cet écran ne demande rien à la base de données. C'est voulu : on met
 *  le site en pause les jours où elle ne répond pas.
 */
export function BoutiqueEnPause() {
  /*
   * Le temps de la pause, on demande aux moteurs de recherche de ne pas
   * retenir cette page. Sans quoi « Afaura Luméa » pourrait se retrouver
   * référencé sur un écran d'attente pendant des semaines après le
   * retour de la boutique.
   */
  useEffect(() => {
    /*
     * On MODIFIE la balise existante, on n'en ajoute pas une seconde.
     *
     * index.html en porte déjà une, « index,follow ». Ajouter « noindex »
     * à côté laissait deux consignes contradictoires dans la même page :
     * les moteurs les départagent chacun à leur façon, et on ne saurait
     * pas laquelle a gagné. On remet l'ancienne valeur en partant, pour
     * que le retour de la boutique n'ait rien à défaire.
     */
    const balise =
      document.querySelector<HTMLMetaElement>('meta[name="robots"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "robots" }),
      );
    const avant = balise.content;
    balise.content = "noindex";
    return () => {
      balise.content = avant;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-blush px-6 py-16 text-center">
      <img
        src={`${import.meta.env.BASE_URL}apple-touch-icon.png`}
        alt=""
        aria-hidden="true"
        className="h-16 w-16 rounded-2xl shadow-sm"
      />

      <h1 className="mt-7 font-serif text-[30px] leading-tight text-ink">
        {BRAND.name}
      </h1>
      <p className="mt-1 text-[12px] uppercase tracking-[0.34em] text-stone">
        {BRAND.city}
      </p>

      <p className="mt-9 max-w-[30rem] text-[16px] leading-relaxed text-ink">
        La boutique en ligne est en cours de mise à jour. Elle revient très
        bientôt, avec les nouveaux voiles.
      </p>

      <p className="mt-4 max-w-[30rem] text-[15px] leading-relaxed text-stone">
        En attendant, rien ne s'arrête&nbsp;: écrivez-nous sur WhatsApp pour
        voir les modèles disponibles, réserver une pièce ou suivre une commande
        en cours.
      </p>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-9 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-8 py-4 text-[16px] font-medium text-white shadow-sm"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 fill-current"
        >
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
          <path d="M12.04 2C6.6 2 2.17 6.43 2.17 11.87c0 1.74.46 3.44 1.32 4.94L2 22l5.34-1.4a9.82 9.82 0 0 0 4.7 1.2h.01c5.44 0 9.87-4.43 9.87-9.87A9.8 9.8 0 0 0 19 4.87 9.8 9.8 0 0 0 12.04 2Zm0 18.05h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.14 8.14 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.2-8.2a8.15 8.15 0 0 1 8.2 8.2c0 4.52-3.68 8.2-8.2 8.2Z" />
        </svg>
        Écrire sur WhatsApp
      </a>

      <p className="mt-4 text-[14px] text-stone">
        ou{" "}
        <a
          href={`tel:+${WHATSAPP_NUMBER}`}
          className="underline underline-offset-2"
        >
          +
          {WHATSAPP_NUMBER.replace(
            /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
            "$1 $2 $3 $4 $5",
          )}
        </a>
      </p>

      <a
        href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 text-[14px] text-stone underline underline-offset-2"
      >
        Les nouveautés sur Instagram · @{INSTAGRAM_HANDLE}
      </a>
    </div>
  );
}
