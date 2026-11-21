    (function () {
      'use strict';

      // =====================================================================
      // COSTANTI & STATO GLOBALE
      // =====================================================================
      const STORAGE_KEY = 'puttantour_2026_2027_membership_v1';
      const SEASON_LABEL = '2026/2027';
      const WHATSAPP_URL = 'https://chat.whatsapp.com/KDhIkQNpuJ49xUUAEasIvQ?s=cl&p=i&iam=2';

      let currentMember = null;
      let maskEmailOnCard = false;

      // Riferimenti DOM principali
      const views = {
        home: document.getElementById('view-home'),
        register: document.getElementById('view-register'),
        issuing: document.getElementById('view-issuing'),
        member: document.getElementById('view-member'),
      };

      const el = {
        navBrandBtn: document.getElementById('nav-brand-btn'),
        navSavedCardBtn: document.getElementById('nav-saved-card-btn'),
        navPrivacyBtn: document.getElementById('nav-privacy-btn'),

        ctaStartRegistration: document.getElementById('cta-start-registration'),
        homeSavedBanner: document.getElementById('home-saved-banner'),
        homeSavedName: document.getElementById('home-saved-name'),
        homeSavedId: document.getElementById('home-saved-id'),
        homeRecoverBtn: document.getElementById('home-recover-btn'),

        btnBackHome: document.getElementById('btn-back-home'),
        form: document.getElementById('registration-form'),
        inputFirstName: document.getElementById('input-firstName'),
        inputLastName: document.getElementById('input-lastName'),
        inputEmail: document.getElementById('input-email'),
        inputDob: document.getElementById('input-dob'),
        inputBudget: document.getElementById('input-budget'),
        inputSizePref: document.getElementById('input-sizePref'),
        inputStylePref: document.getElementById('input-stylePref'),
        inputFormulaPref: document.getElementById('input-formulaPref'),
        inputCustomNote: document.getElementById('input-customNote'),
        inputTerms: document.getElementById('input-terms'),
        formOpenPrivacy: document.getElementById('form-open-privacy'),

        errFirstName: document.getElementById('error-firstName'),
        errLastName: document.getElementById('error-lastName'),
        errEmail: document.getElementById('error-email'),
        errDob: document.getElementById('error-dob'),
        errBudget: document.getElementById('error-budget'),
        errSizePref: document.getElementById('error-sizePref'),
        errStylePref: document.getElementById('error-stylePref'),
        errFormulaPref: document.getElementById('error-formulaPref'),
        errTerms: document.getElementById('error-terms'),

        issuingStatusText: document.getElementById('issuing-status-text'),
        issuingProgressBar: document.getElementById('issuing-progress-bar'),
        stepChecks: [
          document.getElementById('step-check-1'),
          document.getElementById('step-check-2'),
          document.getElementById('step-check-3'),
          document.getElementById('step-check-4'),
        ],

        cardTiltWrapper: document.getElementById('card-tilt-wrapper'),
        digitalCard: document.getElementById('digital-membership-card'),
        cardSheen: document.getElementById('card-sheen'),
        cardFullName: document.getElementById('card-full-name'),
        cardEmail: document.getElementById('card-email'),
        cardMemberId: document.getElementById('card-member-id'),
        cardRegDate: document.getElementById('card-reg-date'),
        cardEditionNo: document.getElementById('card-edition-no'),
        cardQrContainer: document.getElementById('card-qr-container'),
        cardPrefBudget: document.getElementById('card-pref-budget'),
        cardPrefSize: document.getElementById('card-pref-size'),
        cardPrefStyle: document.getElementById('card-pref-style'),
        cardPrefFormula: document.getElementById('card-pref-formula'),
        cardPrefNoteRow: document.getElementById('card-pref-note-row'),
        cardPrefNote: document.getElementById('card-pref-note'),
        infoMemberId: document.getElementById('info-member-id'),

        toggleMaskEmail: document.getElementById('toggle-mask-email'),
        toggleMaskKnob: document.getElementById('toggle-mask-knob'),

        btnDownloadPng: document.getElementById('btn-download-png'),
        btnFullscreen: document.getElementById('btn-fullscreen'),
        btnShare: document.getElementById('btn-share'),
        btnCopyId: document.getElementById('btn-copy-id'),
        copyIdLabel: document.getElementById('copy-id-label'),
        btnMemberHome: document.getElementById('btn-member-home'),
        btnOpenResetModal: document.getElementById('btn-open-reset-modal'),

        modalFullscreen: document.getElementById('modal-fullscreen'),
        fullscreenCardImg: document.getElementById('fullscreen-card-img'),
        btnCloseFullscreen: document.getElementById('btn-close-fullscreen'),
        btnFullscreenDownload: document.getElementById('btn-fullscreen-download'),

        modalPrivacy: document.getElementById('modal-privacy'),
        btnClosePrivacy: document.getElementById('btn-close-privacy'),
        btnAcceptClosePrivacy: document.getElementById('btn-accept-close-privacy'),

        modalReset: document.getElementById('modal-reset'),
        btnCancelReset: document.getElementById('btn-cancel-reset'),
        btnConfirmReset: document.getElementById('btn-confirm-reset'),

        toastContainer: document.getElementById('toast-container'),
      };

      // =====================================================================
      // UTILITÀ GENERALI: TOAST, STORAGE, FORMATTAZIONE, CLIPBOARD
      // =====================================================================

      /**
       * Mostra un messaggio toast elegante in fondo allo schermo.
       */
      function showToast(message, type = 'gold') {
        const toast = document.createElement('div');
        const palette = type === 'error'
          ? 'bg-crimson-950/95 border-red-400/50 text-red-100'
          : type === 'success'
            ? 'bg-obsidian-900/95 border-emerald-400/50 text-emerald-100'
            : 'bg-obsidian-900/95 border-gold-400/55 text-gold-100';

        toast.className = `pointer-events-auto px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-all duration-300 opacity-0 translate-y-3 ${palette}`;
        toast.textContent = message;

        el.toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
          toast.classList.remove('opacity-0', 'translate-y-3');
        });

        setTimeout(() => {
          toast.classList.add('opacity-0', 'translate-y-2');
          setTimeout(() => toast.remove(), 320);
        }, 3200);
      }

      /**
       * Salva la tessera nel localStorage (esclusivamente in locale).
       * Nota: Non salviamo la data di nascita per minimizzare i dati conservati.
       */
      function saveMemberLocally(member) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
          return true;
        } catch (err) {
          console.error('Errore salvataggio localStorage:', err);
          showToast('Impossibile salvare nel browser (modalità privata attiva). Scarica il PNG!', 'error');
          return false;
        }
      }

      /**
       * Recupera eventuale tessera salvata nel localStorage.
       */
      function loadMemberLocally() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id && parsed.firstName && parsed.lastName && parsed.email) {
            return parsed;
          }
          return null;
        } catch (err) {
          console.error('Errore lettura localStorage:', err);
          return null;
        }
      }

      /**
       * Rimuove la tessera salvata dal localStorage.
       */
      function clearMemberLocally() {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
          console.error('Errore rimozione localStorage:', err);
        }
      }

      async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(text);
            return true;
          } catch (_) { /* fallback sotto */ }
        }
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
          document.body.appendChild(textarea);
          textarea.select();
          textarea.setSelectionRange(0, text.length);
          const ok = document.execCommand('copy');
          textarea.remove();
          return ok;
        } catch (_) {
          return false;
        }
      }

      /**
       * Genera un codice identificativo univoco locale (es. PT26-4821-K9M4)
       * e un numero di serie di edizione (es. NO. 04821).
       */
      function generateUniqueIdentifiers() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const randomBlock = (len) => {
          let out = '';
          const array = new Uint32Array(len);
          if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(array);
            for (let i = 0; i < len; i++) {
              out += chars[array[i] % chars.length];
            }
          } else {
            for (let i = 0; i < len; i++) {
              out += chars[Math.floor(Math.random() * chars.length)];
            }
          }
          return out;
        };

        const digitsNum = window.crypto && window.crypto.getRandomValues
          ? (window.crypto.getRandomValues(new Uint32Array(1))[0] % 9000) + 1000
          : Math.floor(1000 + Math.random() * 9000);

        const suffix = randomBlock(4);
        const id = `PT26-${digitsNum}-${suffix}`;
        const editionNo = `NO. 0${digitsNum}`;
        return { id, editionNo };
      }

      /**
       * Formatta la data odierna in italiano (GG/MM/AAAA).
       */
      function formatItalianDate(dateObj) {
        const d = String(dateObj.getDate()).padStart(2, '0');
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const y = dateObj.getFullYear();
        return `${d}/${m}/${y}`;
      }

      /**
       * Oscura parzialmente l'email per tutelare la privacy in caso di condivisione pubblica.
       */
      function getDisplayEmail(email, shouldMask) {
        if (!shouldMask) return email;
        const parts = email.split('@');
        if (parts.length !== 2) return '•••••@•••••';
        const local = parts[0];
        const domain = parts[1];
        const visibleLocal = local.length <= 2 ? local[0] + '•' : local.slice(0, 2) + '••••';
        const domainParts = domain.split('.');
        const tld = domainParts.length > 1 ? '.' + domainParts[domainParts.length - 1] : '';
        const visibleDomain = domainParts[0].slice(0, 2) + '•••' + tld;
        return `${visibleLocal}@${visibleDomain}`;
      }

      /**
       * Calcola l'età esatta in anni compiuti rispetto alla data corrente.
       */
      function calculateExactAge(dobString) {
        if (!dobString) return -1;
        const [year, month, day] = dobString.split('-').map(Number);
        if (!year || !month || !day) return -1;
        const dob = new Date(year, month - 1, day);
        if (Number.isNaN(dob.getTime())) return -1;

        const today = new Date();
        // Controllo anti-date future
        if (dob > today) return -1;

        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age;
      }

      // =====================================================================
      // GENERATORE QR CODE DETERMINISTICO OFFLINE (ZERO LIBRERIE ESTERNE)
      // =====================================================================

      /**
       * Matrice QR reale (ISO/IEC 18004, correzione M) generata offline.
       */
      function generateQrMatrix(text) {
        const qr = qrcode(0, 'M');
        qr.addData(text);
        qr.make();
        const size = qr.getModuleCount();
        return Array.from({ length: size }, (_, r) =>
          Array.from({ length: size }, (_, c) => qr.isDark(r, c))
        );
      }

      function qrPayload(member) {
        return `PUTTANTOUR 26/27 ${member.id}`;
      }

      /**
       * Genera l'SVG nitido del QR Code per la tessera HTML.
       */
      function buildQrSvg(seedText) {
        const matrix = generateQrMatrix(seedText);
        const size = matrix.length;
        let rects = '';

        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (matrix[r][c]) {
              rects += `M${c} ${r}h1v1h-1z`;
            }
          }
        }

        return `<svg viewBox="0 0 ${size} ${size}" class="w-full h-full" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="QR Code della tessera"><path d="${rects}" fill="#0B0B0E"/></svg>`;
      }

      // =====================================================================
      // ESPORTAZIONE PNG AD ALTA RISOLUZIONE (HTML5 CANVAS 1200x756)
      // =====================================================================

      /**
       * Disegna un rettangolo con angoli arrotondati compatibile con tutti i browser.
       */
      function drawRoundedRectPath(ctx, x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
      }

      /**
       * Renderizza la tessera ufficiale ad altissima qualità (1200x756 px)
       * su un canvas in memoria e restituisce il canvas pronto per PNG/Share/Fullscreen.
       */
      async function renderCardToCanvas(member, shouldMaskEmail) {
        // Attende il caricamento dei font web per un risultato tipografico perfetto
        if (document.fonts && document.fonts.load) {
          try {
            await Promise.all([
              '700 34px "Cinzel"', 'italic 500 28px "Cormorant Garamond"',
              '400 22px "Inter"', '600 19px "Inter"', '700 15px "Inter"',
              'italic 400 16px "Inter"', '600 26px "JetBrains Mono"', '500 26px "JetBrains Mono"',
            ].map((f) => document.fonts.load(f)));
            await document.fonts.ready;
          } catch (_) {
            // Prosegue con font di fallback se necessario
          }
        }

        const W = 1200;
        const H = 756;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // 1. Bordo esterno oro metallizzato con angoli arrotondati
        ctx.save();
        drawRoundedRectPath(ctx, 0, 0, W, H, 46);
        ctx.clip();

        const outerGold = ctx.createLinearGradient(0, 0, W, H);
        outerGold.addColorStop(0, '#F3E1A4');
        outerGold.addColorStop(0.35, '#D4AF37');
        outerGold.addColorStop(0.65, '#8F6D13');
        outerGold.addColorStop(1, '#E5C66B');
        ctx.fillStyle = outerGold;
        ctx.fillRect(0, 0, W, H);

        // 2. Corpo interno nero ossidiana -> cremisi profondo
        drawRoundedRectPath(ctx, 5, 5, W - 10, H - 10, 42);
        ctx.save();
        ctx.clip();

        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#16161D');
        bgGrad.addColorStop(0.5, '#0A0A0E');
        bgGrad.addColorStop(1, '#22070D');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Bagliori ambientali interni
        const crimsonGlow = ctx.createRadialGradient(W * 0.88, H * 0.14, 20, W * 0.88, H * 0.14, 460);
        crimsonGlow.addColorStop(0, 'rgba(140, 21, 36, 0.34)');
        crimsonGlow.addColorStop(1, 'rgba(140, 21, 36, 0)');
        ctx.fillStyle = crimsonGlow;
        ctx.fillRect(0, 0, W, H);

        const goldGlow = ctx.createRadialGradient(W * 0.22, H * 0.18, 10, W * 0.22, H * 0.18, 520);
        goldGlow.addColorStop(0, 'rgba(243, 225, 164, 0.13)');
        goldGlow.addColorStop(1, 'rgba(243, 225, 164, 0)');
        ctx.fillStyle = goldGlow;
        ctx.fillRect(0, 0, W, H);

        // 3. Filigrana Guilloché procedurale
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.09)';
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          const offset = i * 22;
          ctx.moveTo(-40, 560 + offset);
          ctx.bezierCurveTo(320, 420 + offset, 760, 690 + offset, W + 40, 520 + offset);
          ctx.stroke();
        }
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const offset = i * 20;
          ctx.moveTo(-40, 120 + offset);
          ctx.bezierCurveTo(360, 260 + offset, 780, 40 + offset, W + 40, 170 + offset);
          ctx.stroke();
        }

        // Cerchi diplomatici filigranati in alto a destra
        ctx.beginPath();
        ctx.setLineDash([7, 9]);
        ctx.arc(980, 165, 210, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(980, 165, 155, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.09)';
        ctx.stroke();

        // 4. Cornice interna dorata sottile
        drawRoundedRectPath(ctx, 28, 28, W - 56, H - 56, 28);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.30)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // 5. Stemma PT in alto a sinistra
        drawRoundedRectPath(ctx, 64, 62, 92, 92, 20);
        const crestBg = ctx.createLinearGradient(64, 62, 156, 154);
        crestBg.addColorStop(0, '#6B0F1A');
        crestBg.addColorStop(1, '#12080B');
        ctx.fillStyle = crestBg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(229, 198, 107, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Scudo vettoriale nello stemma
        ctx.beginPath();
        ctx.moveTo(110, 78);
        ctx.lineTo(136, 89);
        ctx.lineTo(136, 114);
        ctx.quadraticCurveTo(136, 132, 110, 141);
        ctx.quadraticCurveTo(84, 132, 84, 114);
        ctx.lineTo(84, 89);
        ctx.closePath();
        ctx.fillStyle = 'rgba(140, 21, 36, 0.55)';
        ctx.fill();
        ctx.strokeStyle = '#F3E1A4';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.fillStyle = '#FBF3D5';
        ctx.font = '700 22px "Cinzel", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PT', 110, 112);

        // 6. Titolo principale e badge OFFICIAL MEMBER
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        const titleGold = ctx.createLinearGradient(180, 70, 760, 115);
        titleGold.addColorStop(0, '#FBF3D5');
        titleGold.addColorStop(0.5, '#E5C66B');
        titleGold.addColorStop(1, '#D4AF37');
        ctx.fillStyle = titleGold;
        ctx.font = '700 34px "Cinzel", Georgia, serif';
        ctx.fillText('PUTTANTOUR 2026/2027', 180, 104);

        // Badge OFFICIAL MEMBER
        drawRoundedRectPath(ctx, 180, 118, 232, 34, 8);
        ctx.fillStyle = 'rgba(107, 15, 26, 0.88)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = '#F3E1A4';
        ctx.font = '700 15px "Inter", sans-serif';
        ctx.fillText('OFFICIAL MEMBER', 198, 140);

        // 7. Stagione e Numero Edizione in alto a destra
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(229, 198, 107, 0.78)';
        ctx.font = '600 14px "Inter", sans-serif';
        ctx.fillText('STAGIONE', W - 64, 84);

        ctx.fillStyle = '#FAF7F0';
        ctx.font = '700 26px "Cinzel", Georgia, serif';
        ctx.fillText(SEASON_LABEL, W - 64, 116);

        ctx.fillStyle = '#D4AF37';
        ctx.font = '600 18px "JetBrains Mono", monospace';
        ctx.fillText(member.editionNo, W - 64, 146);

        // 8. Chip metallico oro (sinistra centro)
        const chipX = 68;
        const chipY = 186;
        const chipW = 96;
        const chipH = 68;
        drawRoundedRectPath(ctx, chipX, chipY, chipW, chipH, 12);
        const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
        chipGrad.addColorStop(0, '#F3E1A4');
        chipGrad.addColorStop(0.5, '#D4AF37');
        chipGrad.addColorStop(1, '#8F6D13');
        ctx.fillStyle = chipGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 243, 213, 0.75)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Linee circuito del chip
        ctx.strokeStyle = 'rgba(11, 11, 14, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(chipX + 31, chipY + 4); ctx.lineTo(chipX + 31, chipY + chipH - 4);
        ctx.moveTo(chipX + 65, chipY + 4); ctx.lineTo(chipX + 65, chipY + chipH - 4);
        ctx.moveTo(chipX + 4, chipY + 23); ctx.lineTo(chipX + 31, chipY + 23);
        ctx.moveTo(chipX + 4, chipY + 45); ctx.lineTo(chipX + 31, chipY + 45);
        ctx.moveTo(chipX + 65, chipY + 23); ctx.lineTo(chipX + chipW - 4, chipY + 23);
        ctx.moveTo(chipX + 65, chipY + 45); ctx.lineTo(chipX + chipW - 4, chipY + 45);
        ctx.strokeRect(chipX + 37, chipY + 22, 22, 24);
        ctx.stroke();

        // Motto a destra
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(245, 240, 230, 0.80)';
        ctx.font = 'italic 500 28px "Cormorant Garamond", Georgia, serif';
        ctx.fillText('“Non è un viaggio. È una tradizione.”', W - 64, 230);

        // 8b. Fascia Preferenze Diplomatiche
        const prefs = member.preferences || {};
        const hasNote = Boolean(prefs.customNote && prefs.customNote.trim());
        const prefBoxX = 64;
        const prefBoxY = 278;
        const prefBoxW = W - 128;
        const prefBoxH = hasNote ? 124 : 96;

        drawRoundedRectPath(ctx, prefBoxX, prefBoxY, prefBoxW, prefBoxH, 16);
        ctx.fillStyle = 'rgba(6, 6, 8, 0.62)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.32)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(229, 198, 107, 0.85)';
        ctx.font = '600 12px "Inter", sans-serif';
        ctx.fillText('PREFERENZE DIPLOMATICHE', prefBoxX + 20, prefBoxY + 24);

        const prefColumns = [
          { label: 'BUDGET', value: prefs.budget || 'Standard', highlight: true },
          { label: 'DIMENSIONI', value: prefs.sizePref || 'All-Inclusive', highlight: false },
          { label: 'STILE', value: prefs.stylePref || 'Elegante', highlight: false },
          { label: 'FORMULA', value: prefs.formulaPref || 'Full Night', highlight: false },
        ];
        const colW = (prefBoxW - 40) / 4;
        prefColumns.forEach((col, idx) => {
          const cx = prefBoxX + 20 + idx * colW;
          ctx.fillStyle = 'rgba(207, 194, 165, 0.62)';
          ctx.font = '600 11px "Inter", sans-serif';
          ctx.fillText(col.label, cx, prefBoxY + 50);

          ctx.fillStyle = col.highlight ? '#F3E1A4' : '#FAF7F0';
          ctx.font = '600 19px "Inter", sans-serif';
          ctx.fillText(col.value, cx, prefBoxY + 76, colW - 14);
        });

        if (hasNote) {
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(prefBoxX + 20, prefBoxY + 90);
          ctx.lineTo(prefBoxX + prefBoxW - 20, prefBoxY + 90);
          ctx.stroke();

          ctx.fillStyle = 'rgba(229, 198, 107, 0.85)';
          ctx.font = '600 12px "Inter", sans-serif';
          ctx.fillText('EXTRA:', prefBoxX + 20, prefBoxY + 112);

          ctx.fillStyle = 'rgba(245, 240, 230, 0.88)';
          ctx.font = 'italic 400 16px "Inter", sans-serif';
          ctx.fillText(prefs.customNote.trim(), prefBoxX + 82, prefBoxY + 112, prefBoxW - 104);
        }

        // Linea separatrice dorata prima della sezione dati
        const sepGrad = ctx.createLinearGradient(64, 0, W - 64, 0);
        sepGrad.addColorStop(0, 'rgba(212, 175, 55, 0.45)');
        sepGrad.addColorStop(0.7, 'rgba(212, 175, 55, 0.25)');
        sepGrad.addColorStop(1, 'rgba(212, 175, 55, 0.08)');
        ctx.strokeStyle = sepGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(64, 422);
        ctx.lineTo(W - 64, 422);
        ctx.stroke();

        // 9. Dati Titolare (basso sinistra)
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(229, 198, 107, 0.78)';
        ctx.font = '600 15px "Inter", sans-serif';
        ctx.fillText('TITOLARE', 64, 466);

        const fullName = `${member.firstName} ${member.lastName}`.toUpperCase();
        // Ridimensionamento dinamico per nomi lunghi
        let nameFontSize = 44;
        ctx.font = `700 ${nameFontSize}px "Cinzel", Georgia, serif`;
        while (ctx.measureText(fullName).width > 760 && nameFontSize > 26) {
          nameFontSize -= 2;
          ctx.font = `700 ${nameFontSize}px "Cinzel", Georgia, serif`;
        }
        ctx.fillStyle = '#FAF7F0';
        ctx.fillText(fullName, 64, 518);

        // Email (eventualmente oscurata)
        const shownEmail = getDisplayEmail(member.email, shouldMaskEmail);
        ctx.fillStyle = 'rgba(231, 222, 201, 0.84)';
        ctx.font = '400 22px "Inter", sans-serif';
        ctx.fillText(shownEmail, 64, 558);

        // Codice ID e Data di registrazione
        ctx.fillStyle = 'rgba(229, 198, 107, 0.75)';
        ctx.font = '600 14px "Inter", sans-serif';
        ctx.fillText('CODICE IDENTIFICATIVO', 64, 628);
        ctx.fillText('DATA REGISTRAZIONE', 420, 628);

        ctx.fillStyle = '#F3E1A4';
        ctx.font = '600 26px "JetBrains Mono", monospace';
        ctx.fillText(member.id, 64, 666);

        ctx.fillStyle = '#F5F0E6';
        ctx.font = '500 26px "JetBrains Mono", monospace';
        ctx.fillText(member.registeredAt, 420, 666);

        // 10. QR Code deterministico (basso destra)
        const qrBoxSize = 204;
        const qrBoxX = W - 64 - qrBoxSize;
        const qrBoxY = 448;

        drawRoundedRectPath(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
        ctx.fillStyle = '#FAF7F0';
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 4;
        ctx.stroke();

        const matrix = generateQrMatrix(qrPayload(member));
        const qrPad = 18;
        const cellSize = (qrBoxSize - qrPad * 2) / matrix.length;
        ctx.fillStyle = '#0B0B0E';
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix.length; c++) {
            if (matrix[r][c]) {
              ctx.fillRect(
                qrBoxX + qrPad + c * cellSize,
                qrBoxY + qrPad + r * cellSize,
                cellSize + 0.5,
                cellSize + 0.5
              );
            }
          }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(229, 198, 107, 0.8)';
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillText('MEMBER PASS QR', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 24);

        ctx.restore();
        ctx.restore();

        return canvas;
      }

      // =====================================================================
      // GESTIONE DELLE VISTE E AGGIORNAMENTO UI
      // =====================================================================

      function switchView(targetName) {
        Object.entries(views).forEach(([name, section]) => {
          if (name === targetName) {
            section.classList.remove('hidden');
          } else {
            section.classList.add('hidden');
          }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      /**
       * Aggiorna i riferimenti alla tessera salvata nella navbar e nella homepage.
       */
      function refreshSavedIndicators() {
        if (currentMember) {
          el.navSavedCardBtn.classList.remove('hidden');
          el.navSavedCardBtn.classList.add('inline-flex');
          el.homeSavedBanner.classList.remove('hidden');
          el.homeSavedName.textContent = `${currentMember.firstName} ${currentMember.lastName}`;
          el.homeSavedId.textContent = currentMember.id;
        } else {
          el.navSavedCardBtn.classList.add('hidden');
          el.navSavedCardBtn.classList.remove('inline-flex');
          el.homeSavedBanner.classList.add('hidden');
        }
      }

      /**
       * Popola tutti i campi della tessera digitale HTML.
       */
      function populateCardUI(member) {
        if (!member) return;
        el.cardFullName.textContent = `${member.firstName} ${member.lastName}`;
        el.cardEmail.textContent = getDisplayEmail(member.email, maskEmailOnCard);
        el.cardMemberId.textContent = member.id;
        el.cardRegDate.textContent = member.registeredAt;
        el.cardEditionNo.textContent = member.editionNo;
        el.infoMemberId.textContent = member.id;
        el.cardQrContainer.innerHTML = buildQrSvg(qrPayload(member));

        // Popola le preferenze diplomatiche con fallback per tessere precedenti
        const prefs = member.preferences || {};
        el.cardPrefBudget.textContent = prefs.budget || 'Non specificato';
        el.cardPrefSize.textContent = prefs.sizePref || 'Non specificato';
        el.cardPrefStyle.textContent = prefs.stylePref || 'Non specificato';
        el.cardPrefFormula.textContent = prefs.formulaPref || 'Non specificato';

        if (prefs.customNote && prefs.customNote.trim()) {
          el.cardPrefNote.textContent = prefs.customNote.trim();
          el.cardPrefNoteRow.classList.remove('hidden');
        } else {
          el.cardPrefNote.textContent = '';
          el.cardPrefNoteRow.classList.add('hidden');
        }
      }

      /**
       * Mostra o rimuove lo stato di errore su un singolo campo del modulo.
       */
      function setFieldError(inputEl, errorEl, message) {
        if (!errorEl) return;
        if (message) {
          errorEl.textContent = message;
          errorEl.classList.remove('hidden');
          if (inputEl && inputEl.type !== 'checkbox') {
            inputEl.classList.add('border-red-500/80', 'focus:border-red-400', 'focus:ring-red-400/20');
            inputEl.classList.remove('border-gold-400/25', 'focus:border-gold-400', 'focus:ring-gold-400/20');
          }
        } else {
          errorEl.textContent = '';
          errorEl.classList.add('hidden');
          if (inputEl && inputEl.type !== 'checkbox') {
            inputEl.classList.remove('border-red-500/80', 'focus:border-red-400', 'focus:ring-red-400/20');
            inputEl.classList.add('border-gold-400/25', 'focus:border-gold-400', 'focus:ring-gold-400/20');
          }
        }
      }

      function validateRegistrationForm() {
        let isValid = true;

        const firstName = el.inputFirstName.value.trim();
        const lastName = el.inputLastName.value.trim();
        const email = el.inputEmail.value.trim();
        const dob = el.inputDob.value;
        const budget = el.inputBudget.value;
        const sizePref = el.inputSizePref.value;
        const stylePref = el.inputStylePref.value;
        const formulaPref = el.inputFormulaPref.value;
        const customNote = el.inputCustomNote.value.trim();
        const termsAccepted = el.inputTerms.checked;

        // Nome
        if (firstName.length < 2) {
          setFieldError(el.inputFirstName, el.errFirstName, 'Inserisci un nome valido (almeno 2 caratteri).');
          isValid = false;
        } else {
          setFieldError(el.inputFirstName, el.errFirstName, '');
        }

        // Cognome
        if (lastName.length < 2) {
          setFieldError(el.inputLastName, el.errLastName, 'Inserisci un cognome valido (almeno 2 caratteri).');
          isValid = false;
        } else {
          setFieldError(el.inputLastName, el.errLastName, '');
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
          setFieldError(el.inputEmail, el.errEmail, 'Inserisci un indirizzo email valido.');
          isValid = false;
        } else {
          setFieldError(el.inputEmail, el.errEmail, '');
        }

        // Data di nascita & verifica 18+
        if (!dob) {
          setFieldError(el.inputDob, el.errDob, 'Inserisci la tua data di nascita per la verifica 18+.');
          isValid = false;
        } else {
          const age = calculateExactAge(dob);
          if (age < 0 || age > 120) {
            setFieldError(el.inputDob, el.errDob, 'Inserisci una data di nascita valida.');
            isValid = false;
          } else if (age < 18) {
            setFieldError(el.inputDob, el.errDob, 'Accesso negato: devi avere almeno 18 anni compiuti per ottenere la membership.');
            isValid = false;
          } else {
            setFieldError(el.inputDob, el.errDob, '');
          }
        }

        // Preferenze Diplomatiche
        if (!budget) {
          setFieldError(el.inputBudget, el.errBudget, 'Seleziona una fascia di prezzo.');
          isValid = false;
        } else {
          setFieldError(el.inputBudget, el.errBudget, '');
        }

        if (!sizePref) {
          setFieldError(el.inputSizePref, el.errSizePref, 'Seleziona una preferenza di dimensioni/taglia.');
          isValid = false;
        } else {
          setFieldError(el.inputSizePref, el.errSizePref, '');
        }

        if (!stylePref) {
          setFieldError(el.inputStylePref, el.errStylePref, 'Seleziona uno stile preferito.');
          isValid = false;
        } else {
          setFieldError(el.inputStylePref, el.errStylePref, '');
        }

        if (!formulaPref) {
          setFieldError(el.inputFormulaPref, el.errFormulaPref, 'Seleziona la formula preferita.');
          isValid = false;
        } else {
          setFieldError(el.inputFormulaPref, el.errFormulaPref, '');
        }

        // Checkbox Termini & Privacy
        if (!termsAccepted) {
          setFieldError(el.inputTerms, el.errTerms, 'Devi accettare i termini e l’informativa privacy locale per proseguire.');
          isValid = false;
        } else {
          setFieldError(el.inputTerms, el.errTerms, '');
        }

        return isValid
          ? {
              firstName,
              lastName,
              email,
              preferences: {
                budget,
                sizePref,
                stylePref,
                formulaPref,
                customNote,
              },
            }
          : null;
      }

      // =====================================================================
      // SEQUENZA ANIMATA DI RILASCIO MEMBERSHIP
      // =====================================================================

      function runIssuingCeremony(memberData) {
        switchView('issuing');

        // Reset stato animazione
        el.issuingProgressBar.style.width = '8%';
        el.stepChecks.forEach((item) => item.classList.add('opacity-40'));

        const stages = [
          { delay: 220, progress: '28%', text: 'Verifica requisiti anagrafici 18+ completata...', stepIdx: 0 },
          { delay: 820, progress: '56%', text: `Assegnazione protocollo ${memberData.id}...`, stepIdx: 1 },
          { delay: 1450, progress: '84%', text: 'Incisione filigrana aurea e QR identificativo...', stepIdx: 2 },
          { delay: 2050, progress: '100%', text: 'Tessera ufficiale pronta. Benvenuto nella tradizione.', stepIdx: 3 },
        ];

        stages.forEach((stage) => {
          setTimeout(() => {
            el.issuingStatusText.textContent = stage.text;
            el.issuingProgressBar.style.width = stage.progress;
            const checkNode = el.stepChecks[stage.stepIdx];
            if (checkNode) {
              checkNode.classList.remove('opacity-40');
              checkNode.classList.add('opacity-100', 'text-gold-200');
            }
          }, stage.delay);
        });

        setTimeout(() => {
          currentMember = memberData;
          saveMemberLocally(currentMember);
          refreshSavedIndicators();
          populateCardUI(currentMember);
          switchView('member');
          showToast('Tessera ufficiale emessa e salvata sul dispositivo.', 'success');
        }, 2550);
      }

      // =====================================================================
      // AZIONI TESSERA: DOWNLOAD PNG, SCHERMO INTERO, CONDIVISIONE, COPIA ID
      // =====================================================================

      async function handleDownloadPng() {
        if (!currentMember) return;
        try {
          const canvas = await renderCardToCanvas(currentMember, maskEmailOnCard);
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `Puttantour-2026-2027-${currentMember.id}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('Tessera PNG ad alta definizione scaricata.', 'success');
        } catch (err) {
          console.error('Errore download PNG:', err);
          showToast('Impossibile generare il PNG su questo browser.', 'error');
        }
      }

      async function handleOpenFullscreen() {
        if (!currentMember) return;
        try {
          const canvas = await renderCardToCanvas(currentMember, maskEmailOnCard);
          el.fullscreenCardImg.src = canvas.toDataURL('image/png');
          el.modalFullscreen.classList.remove('hidden');
          document.body.classList.add('overflow-hidden');
        } catch (err) {
          console.error('Errore anteprima schermo intero:', err);
          showToast('Errore nell’apertura a schermo intero.', 'error');
        }
      }

      function handleCloseFullscreen() {
        el.modalFullscreen.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }

      async function handleShareCard() {
        if (!currentMember) return;
        const shareText = `PUTTANTOUR 2026/2027 — OFFICIAL MEMBER\n“Non è un viaggio. È una tradizione.”\nCodice Tessera: ${currentMember.id}`;

        try {
          // Tenta la condivisione nativa con allegato PNG su dispositivi compatibili
          if (navigator.share) {
            const canvas = await renderCardToCanvas(currentMember, true);
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

            if (blob && navigator.canShare) {
              const file = new File([blob], `Puttantour-2026-2027-${currentMember.id}.png`, { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'PUTTANTOUR 2026/2027 — Official Member',
                  text: shareText,
                  files: [file],
                });
                showToast('Tessera condivisa (email oscurata per privacy).', 'success');
                return;
              }
            }

            await navigator.share({
              title: 'PUTTANTOUR 2026/2027 — Official Member',
              text: shareText,
            });
            showToast('Messaggio di membership condiviso.', 'success');
            return;
          }
        } catch (err) {
          // Se l'utente annulla la finestra nativa di share, non mostriamo errore
          if (err && err.name === 'AbortError') return;
        }

        // Fallback elegante: copia negli appunti il testo celebrativo
        const copied = await copyTextToClipboard(shareText);
        if (copied) {
          showToast('Testo di condivisione copiato negli appunti!', 'gold');
        } else {
          showToast('Scarica il PNG per condividere la tua tessera.', 'gold');
        }
      }

      async function handleCopyMemberId() {
        if (!currentMember) return;
        const ok = await copyTextToClipboard(currentMember.id);
        if (ok) {
          el.copyIdLabel.textContent = 'Copiato!';
          showToast(`Codice ${currentMember.id} copiato negli appunti.`, 'success');
          setTimeout(() => {
            el.copyIdLabel.textContent = 'Copia ID';
          }, 2000);
        } else {
          showToast('Impossibile copiare automaticamente il codice.', 'error');
        }
      }

      // =====================================================================
      // EFFETTO TILT 3D E RIFLESSO METALLICO SULLA TESSERA
      // =====================================================================

      function bindCardTiltEffect() {
        const wrapper = el.cardTiltWrapper;
        const card = el.digitalCard;
        const sheen = el.cardSheen;

        const updateTilt = (clientX, clientY) => {
          const rect = wrapper.getBoundingClientRect();
          const x = (clientX - rect.left) / rect.width;
          const y = (clientY - rect.top) / rect.height;
          const rotateY = (x - 0.5) * 10;
          const rotateX = (0.5 - y) * 10;

          card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
          sheen.style.background = `radial-gradient(circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(251,243,213,0.28), transparent 58%)`;
        };

        const resetTilt = () => {
          card.style.transform = 'rotateX(0deg) rotateY(0deg)';
          sheen.style.background = 'radial-gradient(circle at 30% 20%, rgba(243,225,164,0.22), transparent 55%)';
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        wrapper.addEventListener('mousemove', (e) => updateTilt(e.clientX, e.clientY));
        wrapper.addEventListener('mouseleave', resetTilt);
        wrapper.addEventListener('touchmove', (e) => {
          if (e.touches && e.touches[0]) {
            updateTilt(e.touches[0].clientX, e.touches[0].clientY);
          }
        }, { passive: true });
        wrapper.addEventListener('touchend', resetTilt);
      }

      // =====================================================================
      // MODALI (PRIVACY & RESET)
      // =====================================================================

      function openPrivacyModal() {
        el.modalPrivacy.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }

      function closePrivacyModal() {
        el.modalPrivacy.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }

      function openResetModal() {
        el.modalReset.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }

      function closeResetModal() {
        el.modalReset.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }

      // =====================================================================
      // EVENT LISTENERS & INIZIALIZZAZIONE
      // =====================================================================

      function init() {
        // Imposta limite massimo sensato per il selettore data (oggi)
        const todayIso = new Date().toISOString().split('T')[0];
        el.inputDob.setAttribute('max', todayIso);

        // Carica eventuale tessera già presente in localStorage
        currentMember = loadMemberLocally();
        refreshSavedIndicators();
        if (currentMember) {
          populateCardUI(currentMember);
        }

        // Navigazione
        el.navBrandBtn.addEventListener('click', () => switchView('home'));
        el.btnBackHome.addEventListener('click', () => switchView('home'));
        el.btnMemberHome.addEventListener('click', () => switchView('home'));

        el.ctaStartRegistration.addEventListener('click', () => {
          switchView('register');
        });

        const openSavedCard = () => {
          if (currentMember) {
            populateCardUI(currentMember);
            switchView('member');
          }
        };
        el.navSavedCardBtn.addEventListener('click', openSavedCard);
        el.homeRecoverBtn.addEventListener('click', openSavedCard);

        // Pulizia errori live mentre l'utente digita
        el.inputFirstName.addEventListener('input', () => setFieldError(el.inputFirstName, el.errFirstName, ''));
        el.inputLastName.addEventListener('input', () => setFieldError(el.inputLastName, el.errLastName, ''));
        el.inputEmail.addEventListener('input', () => setFieldError(el.inputEmail, el.errEmail, ''));
        el.inputDob.addEventListener('change', () => setFieldError(el.inputDob, el.errDob, ''));
        el.inputBudget.addEventListener('change', () => setFieldError(el.inputBudget, el.errBudget, ''));
        el.inputSizePref.addEventListener('change', () => setFieldError(el.inputSizePref, el.errSizePref, ''));
        el.inputStylePref.addEventListener('change', () => setFieldError(el.inputStylePref, el.errStylePref, ''));
        el.inputFormulaPref.addEventListener('change', () => setFieldError(el.inputFormulaPref, el.errFormulaPref, ''));
        el.inputTerms.addEventListener('change', () => setFieldError(el.inputTerms, el.errTerms, ''));

        // Colore segnaposto sulle select personalizzate
        document.querySelectorAll('select[data-lux]').forEach((sel) => {
          const sync = () => sel.classList.toggle('text-ivory-300/45', !sel.value);
          sel.addEventListener('change', sync);
          sel.form && sel.form.addEventListener('reset', () => setTimeout(sync));
          sync();
        });

        // Invio modulo
        el.form.addEventListener('submit', (e) => {
          e.preventDefault();
          const validated = validateRegistrationForm();
          if (!validated) {
            showToast('Controlla i campi evidenziati prima di procedere.', 'error');
            return;
          }

          const { id, editionNo } = generateUniqueIdentifiers();
          const newMember = {
            firstName: validated.firstName,
            lastName: validated.lastName,
            email: validated.email,
            preferences: validated.preferences,
            id,
            editionNo,
            season: SEASON_LABEL,
            registeredAt: formatItalianDate(new Date()),
            createdAtIso: new Date().toISOString(),
          };

          // Reset form per non lasciare in memoria la data di nascita nel DOM
          el.form.reset();
          maskEmailOnCard = false;
          el.toggleMaskEmail.setAttribute('aria-checked', 'false');
          el.toggleMaskEmail.classList.remove('bg-gold-400/35');
          el.toggleMaskKnob.classList.remove('translate-x-5', 'bg-gold-200');
          el.toggleMaskKnob.classList.add('translate-x-0', 'bg-ivory-300');

          runIssuingCeremony(newMember);
        });

        // Toggle oscuramento email
        el.toggleMaskEmail.addEventListener('click', () => {
          maskEmailOnCard = !maskEmailOnCard;
          el.toggleMaskEmail.setAttribute('aria-checked', String(maskEmailOnCard));
          if (maskEmailOnCard) {
            el.toggleMaskEmail.classList.add('bg-gold-400/35');
            el.toggleMaskKnob.classList.remove('translate-x-0', 'bg-ivory-300');
            el.toggleMaskKnob.classList.add('translate-x-5', 'bg-gold-200');
          } else {
            el.toggleMaskEmail.classList.remove('bg-gold-400/35');
            el.toggleMaskKnob.classList.remove('translate-x-5', 'bg-gold-200');
            el.toggleMaskKnob.classList.add('translate-x-0', 'bg-ivory-300');
          }
          populateCardUI(currentMember);
        });

        // Azioni tessera
        el.btnDownloadPng.addEventListener('click', handleDownloadPng);
        el.btnFullscreen.addEventListener('click', handleOpenFullscreen);
        el.btnFullscreenDownload.addEventListener('click', handleDownloadPng);
        el.btnCloseFullscreen.addEventListener('click', handleCloseFullscreen);
        el.btnShare.addEventListener('click', handleShareCard);
        el.btnCopyId.addEventListener('click', handleCopyMemberId);

        // Chiusura cliccando sullo sfondo del modale fullscreen
        el.modalFullscreen.addEventListener('click', (e) => {
          if (e.target === el.modalFullscreen) handleCloseFullscreen();
        });

        // Modale Privacy
        el.navPrivacyBtn.addEventListener('click', openPrivacyModal);
        el.formOpenPrivacy.addEventListener('click', (e) => { e.preventDefault(); openPrivacyModal(); });
        el.btnClosePrivacy.addEventListener('click', closePrivacyModal);
        el.btnAcceptClosePrivacy.addEventListener('click', closePrivacyModal);
        el.modalPrivacy.addEventListener('click', (e) => {
          if (e.target === el.modalPrivacy) closePrivacyModal();
        });

        // Modale Reset tessera locale
        el.btnOpenResetModal.addEventListener('click', openResetModal);
        el.btnCancelReset.addEventListener('click', closeResetModal);
        el.modalReset.addEventListener('click', (e) => {
          if (e.target === el.modalReset) closeResetModal();
        });

        el.btnConfirmReset.addEventListener('click', () => {
          clearMemberLocally();
          currentMember = null;
          refreshSavedIndicators();
          closeResetModal();
          switchView('register');
          showToast('Tessera locale rimossa. Puoi compilare una nuova adesione.', 'gold');
        });

        // Tasto ESC per chiudere eventuali modali aperti
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            handleCloseFullscreen();
            closePrivacyModal();
            closeResetModal();
          }
        });

        // Effetto 3D metallico sulla tessera
        bindCardTiltEffect();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();
  
