(() => {
const form = document.getElementById('sale-form');
const number = (document.querySelector('.sale-direct')?.href.match(/wa\.me\/(\d+)/) || [])[1];
if (!form || !number) return;
form.addEventListener('submit', event => {
event.preventDefault();
const data = new FormData(form);
for (const name of ['name','business','city']) {
const input = form.elements.namedItem(name);
input.setCustomValidity(String(data.get(name)).trim() ? '' : 'Preencha este campo.');
if (!input.reportValidity()) return;
}
const source = new URLSearchParams(location.search);
const campaign = ['utm_source','utm_medium','utm_campaign'].map(key => {
const value = source.get(key);
return value ? key + ': ' + value.slice(0,100).replace(/[\r\n]/g,' ') : '';
}).filter(Boolean).join(' | ');
const message = ['Olá, Derich! Vi a página de sites e quero uma proposta.',
'Nome: ' + String(data.get('name')).trim(),
'Negócio: ' + String(data.get('business')).trim(),
'Cidade: ' + String(data.get('city')).trim(),
'Perfil: ' + (String(data.get('profile')).trim() || 'Não informado'),
'Interesse: ' + (form.elements.namedItem('need').selectedIndex === 0 && window.derichOffer ? window.derichOffer.description() : data.get('need')),
'Origem: Página de oferta' + (campaign ? ' | ' + campaign : '')].join('\n');
document.getElementById('sale-status').textContent = 'Abrindo o WhatsApp. Revise a mensagem e toque em enviar para iniciar a conversa.';
window.siteTrack?.('quote_whatsapp_open', { form_name: 'sale_form' });
location.assign('https://wa.me/' + number + '?text=' + encodeURIComponent(message));
});
form.addEventListener('input', event => { if (event.target.setCustomValidity) event.target.setCustomValidity(''); });
})();
