"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export function GoogleTranslate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }}></div>
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
            }
            // Prevent Google Translate from translating Material Icons which breaks them
            if (typeof MutationObserver !== 'undefined') {
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.addedNodes) {
                    mutation.addedNodes.forEach((node) => {
                      if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('material-symbols-outlined')) {
                          node.classList.add('notranslate');
                        }
                        const icons = node.querySelectorAll ? node.querySelectorAll('.material-symbols-outlined') : [];
                        icons.forEach(icon => icon.classList.add('notranslate'));
                      }
                    });
                  }
                });
              });
              // Observe the whole document
              observer.observe(document.documentElement, { childList: true, subtree: true });
              
              // Handle already existing icons
              window.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('.material-symbols-outlined').forEach(icon => icon.classList.add('notranslate'));
              });
            }
          `,
        }}
      />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
