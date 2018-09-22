'use strict';
/*
 Distributed under MIT License

Copyright 2018 Nabh Inc. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, 
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT 
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/ 
const parse5 = require('parse5')

const Sanitizer = {
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
   'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img', 'iframe' ],
  allowedAttributes: {
    '*': ['class', 'style'],
    a: [ 'href', 'name', 'target' ],
    img: [ 'src' ],
    iframe: ['src']
  },
  allowedIframeDomains: ['www.youtube.com', 'player.vimeo.com'],
  allowedUrlSchemes: [ 'http', 'https', 'ftp', 'mailto' ],

  sanitize: function(html, options) {
    return sanitizeHelper(html, options)
  }
}

function sanitizeHelper(html, options) {
  if (!html) return ""
  options = options ? options : {}
  if (typeof options.allowedTags === "undefined") options.allowedTags = Sanitizer.allowedTags
  if (typeof options.allowedAttributes === "undefined") options.allowedAttributes = Sanitizer.allowedAttributes
  if (typeof options.allowedIframeDomains === "undefined") options.allowedIframeDomains = Sanitizer.allowedIframeDomains
  if (typeof options.allowedUrlSchemes === "undefined") options.allowedUrlSchemes = Sanitizer.allowedUrlSchemes
  if (typeof options.keepComments === "undefined") options.keepComments = true
  let df = parse5.parseFragment(html, options)
  sanitizeChildren(df.childNodes, options)
  return parse5.serialize(df);
}

function allowed(tagName, allowedTags) {
  if (tagName === ('#text')) return true
  if (!allowedTags) return true;
  return allowedTags.includes(tagName)
}

function allowedIframeDomain(url, allowedDomains) {
  if (!url) return false
  let idx = url.indexOf('//')
  if (idx == -1) return false
  url = url.substring(idx+2)
  idx = url.indexOf('/')
  url = idx == -1 ? url : url.substring(0, idx);
  return allowed(url, allowedDomains)
}

function allowedScheme(src, allowedSchemes) {
  let idx = src.indexOf(":")
  if (idx == -1) return true // relative URL allowed
  return allowed(src.substring(0, idx), allowedSchemes)
}
function allowedAttr(nodeName, attrName, attrVal, options) {
  if (options.allowedAttributes['*'] && allowed(attrName, options.allowedAttributes['*'])) return true
  if (nodeName === 'iframe' && attrName === 'src' && !allowedIframeDomain(attrVal, options.allowedIframeDomains)) return false
  if (nodeName === 'a' && attrName === 'href' && !allowedScheme(attrVal, options.allowedUrlSchemes)) return false
  if (options.allowedAttributes[nodeName] && allowed(attrName, options.allowedAttributes[nodeName])) {
    if (options.allowedAttributeValues && options.allowedAttributeValues[nodeName] &&
      !allowed(attrVal, options.allowedAttributeValues[nodeName])) return false
    return true;
  }
  return false;
}

function sanitizeChildren(nodes, options) {
  if (!nodes) return;
  let len = nodes.length - 1
  for (var i=len; i>-1; i--) {
    if (options.keepComments && nodes[i].nodeName === '#comment') continue
    if (!allowed(nodes[i].nodeName, options.allowedTags)) {
      let subNodes = nodes[i].childNodes;
      if (subNodes) sanitizeChildren(subNodes, options)
      if (subNodes && subNodes.length > 0) {
        nodes.splice(i, 1, ...subnodes)
      } else nodes.splice(i, 1)
    }
    else cleanAttributes(nodes[i], options)
  }
  len = nodes.length
  for (var i=0; i<len; i++) sanitizeChildren(nodes[i].childNodes, options)
}

function cleanAttributes(node, options) {
  if (!node.attrs) return;
  let len = node.attrs.length - 1
  for (var i=len; i>-1; i--) {
    if (!allowedAttr(node.nodeName, node.attrs[i].name, node.attrs[i].value, options)) {
      node.attrs.splice(i, 1)
    }
  }
}

module.exports = Sanitizer