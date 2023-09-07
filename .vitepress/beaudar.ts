export function buildBeaudarSrc(options: Record<string, string>) {
  const url = new URL(location.href)

  const attrs: Record<string, string> = { ...options }

  const canonicalLink = document.querySelector(`link[rel='canonical']`) as HTMLLinkElement
  attrs.url = canonicalLink ? canonicalLink.href : url.origin + url.pathname + url.search
  attrs.origin = url.origin
  attrs.pathname = url.pathname.length < 2 ? 'index' : url.pathname.substring(1).replace(/\.\w+$/, '')
  attrs.title = document.title
  const descriptionMeta = document.querySelector(`meta[name='description']`) as HTMLMetaElement
  attrs.description = descriptionMeta ? descriptionMeta.content : ''
  const ogtitleMeta = document.querySelector(`meta[property='og:title'],meta[name='og:title']`) as HTMLMetaElement
  attrs['og:title'] = ogtitleMeta ? ogtitleMeta.content : ''

  return `${options.src}/beaudar.html?${new URLSearchParams(attrs)}`
}
