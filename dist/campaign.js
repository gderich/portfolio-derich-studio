/* One shared offer: absolute deadline in Brasília, never reset per visit. */
(() => {
  const campaign = Object.freeze({
    id: 'sites-outubro-2026', enabled: true,
    startsAt: '2026-10-14T00:00:00-03:00',
    endsAt: '2026-10-19T00:00:00-03:00',
    regularPrice: 1500, price: 750
  });
  const money = value => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value);
  const active = () => campaign.enabled && Date.now() >= Date.parse(campaign.startsAt) && Date.now() < Date.parse(campaign.endsAt);
  window.derichOffer = {active, description: () => active() ? `Site de página única: ${money(campaign.price)} (de ${money(campaign.regularPrice)}), campanha até 18/10/2026, horário de Brasília` : `Site de página única: ${money(campaign.regularPrice)}`};

  const notice = document.querySelector('[data-campaign-notice]');
  const dialog = document.querySelector('#campaign-dialog');
  const isHome = document.body.classList.contains('home-page');
  const dismissKey = `${campaign.id}:follower-dismissed`;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let previousState;
  let followerDismissed = false;
  let followerVisible = false;
  let morphing = false;
  let engagedState = false;
  try { followerDismissed = sessionStorage.getItem(dismissKey) === '1'; } catch (_) {}

  function enhanceHome() {
    if (!isHome) return;
    const lead = document.querySelector('.home-hero .lead');
    if (lead) lead.textContent = 'Sites profissionais para apresentar melhor o seu negócio, facilitar o contato e transformar interesse em oportunidades reais.';
    const actions = document.querySelector('.home-hero .hero-actions');
    if (actions && !document.querySelector('.conversion-points')) {
      const points = document.createElement('div');
      points.className = 'conversion-points';
      points.setAttribute('aria-label','O que você recebe');
      points.innerHTML = '<span>Responsivo no celular</span><span>Contato pelo WhatsApp</span><span>Atendimento direto comigo</span>';
      actions.insertAdjacentElement('afterend', points);
    }
  }

  function coreMarkup() {
    return `<div class="campaign-core"><span class="campaign-core-label"><b>50% OFF</b><span>Site profissional</span></span><strong class="campaign-core-price">${money(campaign.price)}</strong></div>`;
  }

  function renderNoticeCore() {
    if (!notice || !active()) return;
    const wrap = notice.querySelector('.wrap');
    if (!wrap) return;
    wrap.innerHTML = `${coreMarkup()}<a href="sites.html#pacote" data-campaign-open aria-haspopup="dialog">Ver condição ↗</a>`;
  }

  function ensureFollower() {
    if (document.querySelector('[data-campaign-follower]')) return;
    const follower = document.createElement('aside');
    follower.className = 'campaign-follower';
    follower.hidden = true;
    follower.setAttribute('data-campaign-follower','');
    follower.setAttribute('aria-label','Condição especial para criação de site');
    follower.innerHTML = `
      <button type="button" class="campaign-follower-close" aria-label="Fechar oferta">×</button>
      ${coreMarkup()}
      <div class="campaign-follower-details">
        <div class="campaign-follower-meta"><del data-regular-price>${money(campaign.regularPrice)}</del><span>Site de apresentação · até 6 seções</span></div>
        <div class="campaign-follower-action"><span>Termina em <time data-countdown datetime="${campaign.endsAt}"></time></span><a class="pill" href="${location.pathname.includes('sites') ? '#proposta' : 'sites.html#proposta'}">Quero aproveitar ↗</a></div>
      </div>`;
    document.body.appendChild(follower);
    follower.querySelector('.campaign-follower-close')?.addEventListener('click', () => {
      followerDismissed = true;
      try { sessionStorage.setItem(dismissKey,'1'); } catch (_) {}
      follower.hidden = true;
      followerVisible = false;
      follower.classList.remove('is-expanded');
      document.body.classList.remove('campaign-follower-visible');
      if (engagedState) notice?.classList.add('campaign-notice-morphed');
    });
  }

  function refreshEngagedState() {
    const enterAt = Math.max(500, window.innerHeight * .62);
    const leaveAt = Math.max(260, window.innerHeight * .36);
    if (!engagedState && window.scrollY > enterAt) engagedState = true;
    else if (engagedState && window.scrollY < leaveAt) engagedState = false;
    return engagedState;
  }

  function noticeRect() {
    const rect = notice?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) return rect;
    const header = document.querySelector('.top')?.getBoundingClientRect();
    return {left:0,top:header?.bottom || 0,width:window.innerWidth,height:44};
  }

  function performMorph(toFollower) {
    const follower = document.querySelector('[data-campaign-follower]');
    if (!notice || !follower) { morphing = false; return; }

    if (toFollower) {
      follower.hidden = false;
      follower.classList.remove('is-expanded');
      follower.style.visibility = 'hidden';
      notice.classList.remove('campaign-notice-morphed');
    } else {
      notice.classList.remove('campaign-notice-morphed');
      notice.style.visibility = 'hidden';
      follower.style.visibility = 'hidden';
    }

    const start = toFollower ? noticeRect() : follower.getBoundingClientRect();
    const end = toFollower ? follower.getBoundingClientRect() : noticeRect();
    const ghost = document.createElement('div');
    ghost.className = 'campaign-morph';
    ghost.innerHTML = coreMarkup();
    document.body.appendChild(ghost);

    const endWidth = Math.max(1,end.width), endHeight = Math.max(1,end.height);
    const sx = Math.max(.08,start.width/endWidth), sy = Math.max(.08,start.height/endHeight);
    const dx = start.left-end.left, dy = start.top-end.top;
    Object.assign(ghost.style,{left:`${end.left}px`,top:`${end.top}px`,width:`${endWidth}px`,height:`${endHeight}px`,transformOrigin:'0 0',transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`});
    if (toFollower) notice.style.visibility = 'hidden';

    const cardRadius = window.innerWidth <= 620 ? 15 : 18;
    const animation = ghost.animate([
      {transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`,borderRadius:`${toFollower ? 0 : cardRadius}px`,opacity:.98},
      {transform:`translate3d(${dx*.32}px,${dy*.32}px,0) scale(${1+(sx-1)*.16},${1+(sy-1)*.16})`,borderRadius:`${cardRadius}px`,opacity:1,offset:.7},
      {transform:'translate3d(0,0,0) scale(1,1)',borderRadius:`${toFollower ? cardRadius : 0}px`,opacity:1}
    ],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});

    animation.onfinish = () => {
      ghost.remove();
      if (toFollower) {
        notice.style.visibility = '';
        notice.classList.add('campaign-notice-morphed');
        follower.style.visibility = '';
        follower.hidden = false;
        followerVisible = true;
        document.body.classList.add('campaign-follower-visible');
        requestAnimationFrame(() => requestAnimationFrame(() => follower.classList.add('is-expanded')));
      } else {
        follower.hidden = true;
        follower.style.visibility = '';
        followerVisible = false;
        notice.style.visibility = '';
        notice.classList.remove('campaign-notice-morphed');
        document.body.classList.remove('campaign-follower-visible');
      }
      morphing = false;
    };
    animation.oncancel = () => {
      ghost.remove();
      notice.style.visibility = '';
      follower.style.visibility = '';
      morphing = false;
      updateFollowerVisibility();
    };
  }

  function morphOffer(toFollower) {
    const follower = document.querySelector('[data-campaign-follower]');
    if (!notice || !follower || morphing || reduceMotion) return false;
    morphing = true;
    if (!toFollower && follower.classList.contains('is-expanded')) {
      follower.classList.remove('is-expanded');
      setTimeout(() => performMorph(false), 190);
    } else performMorph(toFollower);
    return true;
  }

  function updateFollowerVisibility() {
    const follower = document.querySelector('[data-campaign-follower]');
    if (!follower || morphing) return;
    const engaged = refreshEngagedState();
    const show = active() && !followerDismissed && !dialog?.open && engaged;
    if (show && !followerVisible) {
      if (!morphOffer(true)) {
        notice?.classList.add('campaign-notice-morphed');
        follower.hidden = false;
        followerVisible = true;
        follower.classList.add('is-expanded');
        document.body.classList.add('campaign-follower-visible');
      }
      return;
    }
    if (!engaged && followerVisible) {
      if (!morphOffer(false)) {
        follower.classList.remove('is-expanded');
        follower.hidden = true;
        followerVisible = false;
        notice?.classList.remove('campaign-notice-morphed');
        document.body.classList.remove('campaign-follower-visible');
      }
      return;
    }
    if (engaged) notice?.classList.add('campaign-notice-morphed'); else notice?.classList.remove('campaign-notice-morphed');
    if (!show && followerVisible && (followerDismissed || dialog?.open || !active())) {
      follower.classList.remove('is-expanded');
      follower.hidden = true;
      followerVisible = false;
      document.body.classList.remove('campaign-follower-visible');
    }
  }

  function bindNoticeOpen() {
    notice?.querySelector('[data-campaign-open]')?.addEventListener('click', event => {
      render();
      if (!active() || !dialog?.showModal) return;
      event.preventDefault();
      dialog.showModal();
      updateFollowerVisibility();
    });
  }

  function render() {
    const isActive = active();
    if (previousState !== isActive) {
      document.querySelectorAll('[data-site-price]').forEach(el => { el.textContent = money(isActive ? campaign.price : campaign.regularPrice); });
      document.querySelectorAll('[data-campaign-only]').forEach(el => { el.hidden = !isActive; });
      document.querySelectorAll('[data-regular-price]').forEach(el => { el.textContent = money(campaign.regularPrice); });
      document.querySelectorAll('[data-campaign-saving]').forEach(el => { el.textContent = money(campaign.regularPrice-campaign.price); });
      if (isActive) { renderNoticeCore(); bindNoticeOpen(); }
      const option = document.querySelector('[data-site-option]');
      if (option) option.value = option.textContent = window.derichOffer.description();
      const direct = document.querySelector('.sale-direct');
      if (direct) { const url = new URL(direct.href); url.searchParams.set('text','Olá, Derich! Quero uma proposta. '+window.derichOffer.description()); direct.href = url.href; }
      if (!isActive && dialog?.open) dialog.close();
      previousState = isActive;
    }
    if (!isActive) { updateFollowerVisibility(); return; }
    const seconds = Math.max(0,Math.ceil((Date.parse(campaign.endsAt)-Date.now())/1000));
    const values = [Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];
    document.querySelectorAll('[data-countdown]').forEach(el => { el.textContent = `${values[0]}d ${String(values[1]).padStart(2,'0')}h ${String(values[2]).padStart(2,'0')}m ${String(values[3]).padStart(2,'0')}s`; });
    updateFollowerVisibility();
  }

  enhanceHome(); ensureFollower(); refreshEngagedState(); render();
  setInterval(render,1000);
  document.addEventListener('visibilitychange',render);
  document.addEventListener('submit',render,true);
  window.addEventListener('scroll',updateFollowerVisibility,{passive:true});
  window.addEventListener('resize',updateFollowerVisibility);
  dialog?.querySelector('[data-campaign-close]')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog?.addEventListener('close',updateFollowerVisibility);

  const source = new URLSearchParams(location.search);
  document.querySelectorAll('a[href^="sites.html"]').forEach(link => {
    const url = new URL(link.href);
    ['utm_source','utm_medium','utm_campaign'].forEach(key => { if (source.has(key)) url.searchParams.set(key,source.get(key).slice(0,100)); });
    link.href = url.href;
  });
})();
