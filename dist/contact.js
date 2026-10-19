(() => {
  const links = document.querySelectorAll('a[href^="https://wa.me/"]');
  const number = links[0]?.href.match(/wa\.me\/(\d+)/)?.[1];
  if (!number) return;
  if (!links.length || typeof HTMLDialogElement === 'undefined' || !('showModal' in HTMLDialogElement.prototype)) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'brief-dialog';
  dialog.setAttribute('aria-labelledby', 'brief-title');
  dialog.innerHTML = `
    <div class="brief-layout">
      <div class="brief-intro">
        <span class="brief-brand">derich<span>studio.</span></span>
        <span class="eyebrow">O começo de algo bom</span>
        <h2 id="brief-title">Me conte o que seu projeto precisa.</h2>
        <p>Três respostas rápidas para entender sua ideia e começar uma conversa que faça sentido para você.</p>
        <span class="brief-decoration" aria-hidden="true">↗</span>
      </div>
      <div class="brief-content">
        <button type="button" class="brief-close" aria-label="Fechar formulário">×</button>
        <form id="project-brief">
          <label for="brief-name">01 / Seu nome e seu negócio</label>
          <div class="brief-name-row">
            <input id="brief-name" name="name" type="text" autocomplete="name" placeholder="Seu nome" aria-label="Seu nome" maxlength="60" required>
            <input id="brief-business" name="business" type="text" autocomplete="organization" placeholder="Nome ou tipo de negócio" aria-label="Nome ou tipo de negócio" maxlength="80" required>
          </div>
          <label for="brief-idea">02 / O que você imagina criar?</label>
          <textarea id="brief-idea" name="idea" rows="3" maxlength="450" placeholder="Pode ser uma ideia pronta ou apenas o começo dela." required></textarea>
          <label for="brief-challenge">03 / Que dificuldade isso resolveria?</label>
          <textarea id="brief-challenge" name="challenge" rows="3" maxlength="450" placeholder="Conte o que hoje atrapalha você ou as pessoas que vão usar." required></textarea>
          <button class="pill brief-submit" type="submit">Continuar no WhatsApp <span aria-hidden="true">↗</span></button>
          <p class="brief-note">As respostas entram na mensagem do WhatsApp. Você pode revisá-la antes de enviar.</p>
        </form>
        <a class="brief-direct" href="https://wa.me/${number}?text=${encodeURIComponent('Olá, Derich! Vi seu portfólio e gostaria de conversar sobre uma ideia.')}">Prefiro conversar direto, sem preencher ↗</a>
      </div>
    </div>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const close = dialog.querySelector('.brief-close');
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  links.forEach(link => link.addEventListener('click', (event) => {
    event.preventDefault();
    dialog.showModal();
    dialog.querySelector('#brief-name').focus();
  }));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const message = `Olá, Derich! Vi seu portfólio e gostaria de conversar sobre um projeto.\n\n*Nome:* ${data.get('name').trim()}\n*Negócio:* ${data.get('business').trim()}\n*Ideia:* ${data.get('idea').trim()}\n*Dificuldade que quero resolver:* ${data.get('challenge').trim()}`;
window.siteTrack?.('quote_whatsapp_open', { form_name: 'project_brief' });
    window.location.assign(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
  });
})();
