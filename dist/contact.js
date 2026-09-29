(() => {
  const number = '5585996946551';
  const links = document.querySelectorAll('a[href^="https://wa.me/5585996946551"]');
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
        <p>Três respostas rápidas para começarmos uma conversa que já faça sentido para você.</p>
        <span class="brief-decoration" aria-hidden="true">↗</span>
      </div>
      <div class="brief-content">
        <button type="button" class="brief-close" aria-label="Fechar formulário">×</button>
        <form id="project-brief">
          <label for="brief-name">01 / Seu nome e seu negócio</label>
          <div class="brief-name-row">
            <input id="brief-name" name="name" type="text" autocomplete="name" placeholder="Seu nome" maxlength="60" required>
            <input id="brief-business" name="business" type="text" autocomplete="organization" placeholder="Nome ou tipo de negócio" maxlength="80" required>
          </div>
          <fieldset>
            <legend>02 / O que você precisa?</legend>
            <div class="brief-options">
              <label><input type="radio" name="service" value="Um site profissional" required><span>Um site</span></label>
              <label><input type="radio" name="service" value="Site com agendamento"><span>Agendamento</span></label>
              <label><input type="radio" name="service" value="Ainda quero entender a melhor solução"><span>Ainda não sei</span></label>
            </div>
          </fieldset>
          <label for="brief-challenge">03 / O que você quer melhorar hoje?</label>
          <textarea id="brief-challenge" name="challenge" rows="3" maxlength="450" placeholder="Ex.: perco clientes porque meus serviços e horários estão espalhados nas redes sociais." required></textarea>
          <button class="pill brief-submit" type="submit">Continuar no WhatsApp <span aria-hidden="true">↗</span></button>
          <p class="brief-note">As respostas entram na mensagem do WhatsApp. Você pode revisá-la antes de enviar.</p>
        </form>
        <a class="brief-direct" href="https://wa.me/${number}?text=${encodeURIComponent('Olá, Derich! Vi seu portfólio e gostaria de conversar sobre um site.')}">Prefiro conversar direto, sem preencher ↗</a>
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
    const message = `Olá, Derich! Vi seu portfólio e gostaria de conversar sobre um projeto.\n\n*Nome:* ${data.get('name').trim()}\n*Negócio:* ${data.get('business').trim()}\n*Preciso de:* ${data.get('service')}\n*Quero melhorar:* ${data.get('challenge').trim()}`;
    window.location.assign(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
  });
})();
