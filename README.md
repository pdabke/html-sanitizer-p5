# html-sanitizer-p5


`html-sanitizer-p5` is a simple HTML sanitizer built on parse5.

`html-sanitizer-p5` allows you to specify HTML tags and attributes that you want to keep. If a tag or attribute is not allowed, it is deleted. Tag contents are preserved subject to options.

`href` attributes are validated to ensure they only contain `http`, `https`, `ftp` and `mailto` URLs. Relative URLs are also allowed. You can also limit src domains for iframes.

HTML comments are preserved by default. You can change this behavior by setting the option `keepComments` to `false`.

## Requirements

`html-sanitizer-p5` is a pure Javascript module with only one dependency on `parse5`.

## Install

```bash
npm install html-sanitizer-p5
```

## Usage

```js
var sanitizer = require('html-sanitizer-p5');

/* Santize HTML fragments typically submitted by WYSIWYG editors like tinyMCE */
var html = '<div class="p-1"><script src="http://malicious.org"></script></div>';
var clean = sanitizer.sanitize(html);

```

That will allow the default list of allowed tags and attributes. You can override default behavior as follows:

```js
// Allow only a restricted set of tags and attributes
clean = sanitizer.sanitize(html, {
  allowedTags: [ 'h4', 'p', 'br' ],
  allowedAttributes: {
    'a': [ 'href' ]
  },
  allowedIframeDomains: ['www.youtube.com']
});
```

## Options

* allowedTags - Array of tag names. Specify `false` to allow everything and `[]` to allow nothing.
* allowedAttributes - Object that specifies allowed attributes for one more tags. Use '\*' to specify attributes that are allowed on any element. For example: 
```js
{ 
  '*': ['class', 'style'], 
  'img': ['src']
} 
```
* allowedIframeDomains - Array of domains that can appear as iframe source
* allowedUrlSchemes - Array of URL schemes that are allowed in href attribute of links
* keepComments - Specify `false` to remove comments

## Defaults
Default option values are available via properties of the sanitizer object with the same name. For example `sanitizer.allowedTags` returns default array of allowed tags.

```js
{
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul',
  'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img', 'iframe' ],
  allowedAttributes: {
    '*': ['class', 'style'],
    a: [ 'href', 'name', 'target' ],
    img: [ 'src' ],
    iframe: ['src']
  },
  allowedIframeDomains: ['www.youtube.com', 'player.vimeo.com'],
  allowedUrlSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
}
```
