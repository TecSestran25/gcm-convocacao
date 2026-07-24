import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:tec.informacao.sestran@gmail.com', // Pode colocar seu e-mail aqui
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export default webpush