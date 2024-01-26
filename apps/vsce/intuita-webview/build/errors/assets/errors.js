(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();var _t,v,ls,Oe,ln,cs,Ci,ds,ft={},hs=[],ko=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Yt=Array.isArray;function pe(i,e){for(var t in e)i[t]=e[t];return i}function us(i){var e=i.parentNode;e&&e.removeChild(i)}function me(i,e,t){var n,s,o,r={};for(o in e)o=="key"?n=e[o]:o=="ref"?s=e[o]:r[o]=e[o];if(arguments.length>2&&(r.children=arguments.length>3?_t.call(arguments,2):t),typeof i=="function"&&i.defaultProps!=null)for(o in i.defaultProps)r[o]===void 0&&(r[o]=i.defaultProps[o]);return ct(i,r,n,s,null)}function ct(i,e,t,n,s){var o={type:i,props:e,key:t,ref:n,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:s??++ls,__i:-1,__u:0};return s==null&&v.vnode!=null&&v.vnode(o),o}function To(){return{current:null}}function ge(i){return i.children}function de(i,e){this.props=i,this.context=e}function Ue(i,e){if(e==null)return i.__?Ue(i.__,i.__i+1):null;for(var t;e<i.__k.length;e++)if((t=i.__k[e])!=null&&t.__e!=null)return t.__e;return typeof i.type=="function"?Ue(i):null}function ps(i){var e,t;if((i=i.__)!=null&&i.__c!=null){for(i.__e=i.__c.base=null,e=0;e<i.__k.length;e++)if((t=i.__k[e])!=null&&t.__e!=null){i.__e=i.__c.base=t.__e;break}return ps(i)}}function ki(i){(!i.__d&&(i.__d=!0)&&Oe.push(i)&&!Ut.__r++||ln!==v.debounceRendering)&&((ln=v.debounceRendering)||cs)(Ut)}function Ut(){var i,e,t,n,s,o,r,a,l;for(Oe.sort(Ci);i=Oe.shift();)i.__d&&(e=Oe.length,n=void 0,o=(s=(t=i).__v).__e,a=[],l=[],(r=t.__P)&&((n=pe({},s)).__v=s.__v+1,v.vnode&&v.vnode(n),Li(r,n,s,t.__n,r.ownerSVGElement!==void 0,32&s.__u?[o]:null,a,o??Ue(s),!!(32&s.__u),l),n.__.__k[n.__i]=n,ms(a,n,l),n.__e!=o&&ps(n)),Oe.length>e&&Oe.sort(Ci));Ut.__r=0}function fs(i,e,t,n,s,o,r,a,l,d,u){var c,f,b,y,T,I=n&&n.__k||hs,C=e.length;for(t.__d=l,Io(t,e,I),l=t.__d,c=0;c<C;c++)(b=t.__k[c])!=null&&typeof b!="boolean"&&typeof b!="function"&&(f=b.__i===-1?ft:I[b.__i]||ft,b.__i=c,Li(i,b,f,s,o,r,a,l,d,u),y=b.__e,b.ref&&f.ref!=b.ref&&(f.ref&&Hi(f.ref,null,b),u.push(b.ref,b.__c||y,b)),T==null&&y!=null&&(T=y),65536&b.__u||f.__k===b.__k?l=bs(b,l,i):typeof b.type=="function"&&b.__d!==void 0?l=b.__d:y&&(l=y.nextSibling),b.__d=void 0,b.__u&=-196609);t.__d=l,t.__e=T}function Io(i,e,t){var n,s,o,r,a,l=e.length,d=t.length,u=d,c=0;for(i.__k=[],n=0;n<l;n++)(s=i.__k[n]=(s=e[n])==null||typeof s=="boolean"||typeof s=="function"?null:typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?ct(null,s,null,null,s):Yt(s)?ct(ge,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?ct(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):s)!=null?(s.__=i,s.__b=i.__b+1,a=So(s,t,r=n+c,u),s.__i=a,o=null,a!==-1&&(u--,(o=t[a])&&(o.__u|=131072)),o==null||o.__v===null?(a==-1&&c--,typeof s.type!="function"&&(s.__u|=65536)):a!==r&&(a===r+1?c++:a>r?u>l-r?c+=a-r:c--:c=a<r&&a==r-1?a-r:0,a!==n+c&&(s.__u|=65536))):(o=t[n])&&o.key==null&&o.__e&&(o.__e==i.__d&&(i.__d=Ue(o)),Ti(o,o,!1),t[n]=null,u--);if(u)for(n=0;n<d;n++)(o=t[n])!=null&&!(131072&o.__u)&&(o.__e==i.__d&&(i.__d=Ue(o)),Ti(o,o))}function bs(i,e,t){var n,s;if(typeof i.type=="function"){for(n=i.__k,s=0;n&&s<n.length;s++)n[s]&&(n[s].__=i,e=bs(n[s],e,t));return e}return i.__e!=e&&(t.insertBefore(i.__e,e||null),e=i.__e),e&&e.nextSibling}function be(i,e){return e=e||[],i==null||typeof i=="boolean"||(Yt(i)?i.some(function(t){be(t,e)}):e.push(i)),e}function So(i,e,t,n){var s=i.key,o=i.type,r=t-1,a=t+1,l=e[t];if(l===null||l&&s==l.key&&o===l.type)return t;if(n>(l!=null&&!(131072&l.__u)?1:0))for(;r>=0||a<e.length;){if(r>=0){if((l=e[r])&&!(131072&l.__u)&&s==l.key&&o===l.type)return r;r--}if(a<e.length){if((l=e[a])&&!(131072&l.__u)&&s==l.key&&o===l.type)return a;a++}}return-1}function cn(i,e,t){e[0]==="-"?i.setProperty(e,t??""):i[e]=t==null?"":typeof t!="number"||ko.test(e)?t:t+"px"}function Rt(i,e,t,n,s){var o;e:if(e==="style")if(typeof t=="string")i.style.cssText=t;else{if(typeof n=="string"&&(i.style.cssText=n=""),n)for(e in n)t&&e in t||cn(i.style,e,"");if(t)for(e in t)n&&t[e]===n[e]||cn(i.style,e,t[e])}else if(e[0]==="o"&&e[1]==="n")o=e!==(e=e.replace(/(PointerCapture)$|Capture$/,"$1")),e=e.toLowerCase()in i?e.toLowerCase().slice(2):e.slice(2),i.l||(i.l={}),i.l[e+o]=t,t?n?t.u=n.u:(t.u=Date.now(),i.addEventListener(e,o?hn:dn,o)):i.removeEventListener(e,o?hn:dn,o);else{if(s)e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!=="width"&&e!=="height"&&e!=="href"&&e!=="list"&&e!=="form"&&e!=="tabIndex"&&e!=="download"&&e!=="rowSpan"&&e!=="colSpan"&&e!=="role"&&e in i)try{i[e]=t??"";break e}catch{}typeof t=="function"||(t==null||t===!1&&e[4]!=="-"?i.removeAttribute(e):i.setAttribute(e,t))}}function dn(i){var e=this.l[i.type+!1];if(i.t){if(i.t<=e.u)return}else i.t=Date.now();return e(v.event?v.event(i):i)}function hn(i){return this.l[i.type+!0](v.event?v.event(i):i)}function Li(i,e,t,n,s,o,r,a,l,d){var u,c,f,b,y,T,I,C,_,L,se,oe,he,St,ri,ee=e.type;if(e.constructor!==void 0)return null;128&t.__u&&(l=!!(32&t.__u),o=[a=e.__e=t.__e]),(u=v.__b)&&u(e);e:if(typeof ee=="function")try{if(C=e.props,_=(u=ee.contextType)&&n[u.__c],L=u?_?_.props.value:u.__:n,t.__c?I=(c=e.__c=t.__c).__=c.__E:("prototype"in ee&&ee.prototype.render?e.__c=c=new ee(C,L):(e.__c=c=new de(C,L),c.constructor=ee,c.render=Ro),_&&_.sub(c),c.props=C,c.state||(c.state={}),c.context=L,c.__n=n,f=c.__d=!0,c.__h=[],c._sb=[]),c.__s==null&&(c.__s=c.state),ee.getDerivedStateFromProps!=null&&(c.__s==c.state&&(c.__s=pe({},c.__s)),pe(c.__s,ee.getDerivedStateFromProps(C,c.__s))),b=c.props,y=c.state,c.__v=e,f)ee.getDerivedStateFromProps==null&&c.componentWillMount!=null&&c.componentWillMount(),c.componentDidMount!=null&&c.__h.push(c.componentDidMount);else{if(ee.getDerivedStateFromProps==null&&C!==b&&c.componentWillReceiveProps!=null&&c.componentWillReceiveProps(C,L),!c.__e&&(c.shouldComponentUpdate!=null&&c.shouldComponentUpdate(C,c.__s,L)===!1||e.__v===t.__v)){for(e.__v!==t.__v&&(c.props=C,c.state=c.__s,c.__d=!1),e.__e=t.__e,e.__k=t.__k,e.__k.forEach(function(Ot){Ot&&(Ot.__=e)}),se=0;se<c._sb.length;se++)c.__h.push(c._sb[se]);c._sb=[],c.__h.length&&r.push(c);break e}c.componentWillUpdate!=null&&c.componentWillUpdate(C,c.__s,L),c.componentDidUpdate!=null&&c.__h.push(function(){c.componentDidUpdate(b,y,T)})}if(c.context=L,c.props=C,c.__P=i,c.__e=!1,oe=v.__r,he=0,"prototype"in ee&&ee.prototype.render){for(c.state=c.__s,c.__d=!1,oe&&oe(e),u=c.render(c.props,c.state,c.context),St=0;St<c._sb.length;St++)c.__h.push(c._sb[St]);c._sb=[]}else do c.__d=!1,oe&&oe(e),u=c.render(c.props,c.state,c.context),c.state=c.__s;while(c.__d&&++he<25);c.state=c.__s,c.getChildContext!=null&&(n=pe(pe({},n),c.getChildContext())),f||c.getSnapshotBeforeUpdate==null||(T=c.getSnapshotBeforeUpdate(b,y)),fs(i,Yt(ri=u!=null&&u.type===ge&&u.key==null?u.props.children:u)?ri:[ri],e,t,n,s,o,r,a,l,d),c.base=e.__e,e.__u&=-161,c.__h.length&&r.push(c),I&&(c.__E=c.__=null)}catch(Ot){e.__v=null,l||o!=null?(e.__e=a,e.__u|=l?160:32,o[o.indexOf(a)]=null):(e.__e=t.__e,e.__k=t.__k),v.__e(Ot,e,t)}else o==null&&e.__v===t.__v?(e.__k=t.__k,e.__e=t.__e):e.__e=Oo(t.__e,e,t,n,s,o,r,l,d);(u=v.diffed)&&u(e)}function ms(i,e,t){e.__d=void 0;for(var n=0;n<t.length;n++)Hi(t[n],t[++n],t[++n]);v.__c&&v.__c(e,i),i.some(function(s){try{i=s.__h,s.__h=[],i.some(function(o){o.call(s)})}catch(o){v.__e(o,s.__v)}})}function Oo(i,e,t,n,s,o,r,a,l){var d,u,c,f,b,y,T,I=t.props,C=e.props,_=e.type;if(_==="svg"&&(s=!0),o!=null){for(d=0;d<o.length;d++)if((b=o[d])&&"setAttribute"in b==!!_&&(_?b.localName===_:b.nodeType===3)){i=b,o[d]=null;break}}if(i==null){if(_===null)return document.createTextNode(C);i=s?document.createElementNS("http://www.w3.org/2000/svg",_):document.createElement(_,C.is&&C),o=null,a=!1}if(_===null)I===C||a&&i.data===C||(i.data=C);else{if(o=o&&_t.call(i.childNodes),I=t.props||ft,!a&&o!=null)for(I={},d=0;d<i.attributes.length;d++)I[(b=i.attributes[d]).name]=b.value;for(d in I)b=I[d],d=="children"||(d=="dangerouslySetInnerHTML"?c=b:d==="key"||d in C||Rt(i,d,null,b,s));for(d in C)b=C[d],d=="children"?f=b:d=="dangerouslySetInnerHTML"?u=b:d=="value"?y=b:d=="checked"?T=b:d==="key"||a&&typeof b!="function"||I[d]===b||Rt(i,d,b,I[d],s);if(u)a||c&&(u.__html===c.__html||u.__html===i.innerHTML)||(i.innerHTML=u.__html),e.__k=[];else if(c&&(i.innerHTML=""),fs(i,Yt(f)?f:[f],e,t,n,s&&_!=="foreignObject",o,r,o?o[0]:t.__k&&Ue(t,0),a,l),o!=null)for(d=o.length;d--;)o[d]!=null&&us(o[d]);a||(d="value",y!==void 0&&(y!==i[d]||_==="progress"&&!y||_==="option"&&y!==I[d])&&Rt(i,d,y,I[d],!1),d="checked",T!==void 0&&T!==i[d]&&Rt(i,d,T,I[d],!1))}return i}function Hi(i,e,t){try{typeof i=="function"?i(e):i.current=e}catch(n){v.__e(n,t)}}function Ti(i,e,t){var n,s;if(v.unmount&&v.unmount(i),(n=i.ref)&&(n.current&&n.current!==i.__e||Hi(n,null,e)),(n=i.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(o){v.__e(o,e)}n.base=n.__P=null,i.__c=void 0}if(n=i.__k)for(s=0;s<n.length;s++)n[s]&&Ti(n[s],e,t||typeof i.type!="function");t||i.__e==null||us(i.__e),i.__=i.__e=i.__d=void 0}function Ro(i,e,t){return this.constructor(i,t)}function bt(i,e,t){var n,s,o,r;v.__&&v.__(i,e),s=(n=typeof t=="function")?null:t&&t.__k||e.__k,o=[],r=[],Li(e,i=(!n&&t||e).__k=me(ge,null,[i]),s||ft,ft,e.ownerSVGElement!==void 0,!n&&t?[t]:s?null:e.firstChild?_t.call(e.childNodes):null,o,!n&&t?t:s?s.__e:e.firstChild,n,r),ms(o,i,r)}function gs(i,e){bt(i,e,gs)}function Eo(i,e,t){var n,s,o,r,a=pe({},i.props);for(o in i.type&&i.type.defaultProps&&(r=i.type.defaultProps),e)o=="key"?n=e[o]:o=="ref"?s=e[o]:a[o]=e[o]===void 0&&r!==void 0?r[o]:e[o];return arguments.length>2&&(a.children=arguments.length>3?_t.call(arguments,2):t),ct(i.type,a,n||i.key,s||i.ref,null)}function Ao(i,e){var t={__c:e="__cC"+ds++,__:i,Consumer:function(n,s){return n.children(s)},Provider:function(n){var s,o;return this.getChildContext||(s=[],(o={})[e]=this,this.getChildContext=function(){return o},this.shouldComponentUpdate=function(r){this.props.value!==r.value&&s.some(function(a){a.__e=!0,ki(a)})},this.sub=function(r){s.push(r);var a=r.componentWillUnmount;r.componentWillUnmount=function(){s.splice(s.indexOf(r),1),a&&a.call(r)}}),n.children}};return t.Provider.__=t.Consumer.contextType=t}_t=hs.slice,v={__e:function(i,e,t,n){for(var s,o,r;e=e.__;)if((s=e.__c)&&!s.__)try{if((o=s.constructor)&&o.getDerivedStateFromError!=null&&(s.setState(o.getDerivedStateFromError(i)),r=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(i,n||{}),r=s.__d),r)return s.__E=s}catch(a){i=a}throw i}},ls=0,de.prototype.setState=function(i,e){var t;t=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=pe({},this.state),typeof i=="function"&&(i=i(pe({},t),this.props)),i&&pe(t,i),i!=null&&this.__v&&(e&&this._sb.push(e),ki(this))},de.prototype.forceUpdate=function(i){this.__v&&(this.__e=!0,i&&this.__h.push(i),ki(this))},de.prototype.render=ge,Oe=[],cs=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Ci=function(i,e){return i.__v.__b-e.__v.__b},Ut.__r=0,ds=0;var we,O,ai,un,qe=0,vs=[],Ht=[],pn=v.__b,fn=v.__r,bn=v.diffed,mn=v.__c,gn=v.unmount;function Xe(i,e){v.__h&&v.__h(O,i,qe||e),qe=0;var t=O.__H||(O.__H={__:[],__h:[]});return i>=t.__.length&&t.__.push({__V:Ht}),t.__[i]}function Vi(i){return qe=1,ys(xs,i)}function ys(i,e,t){var n=Xe(we++,2);if(n.t=i,!n.__c&&(n.__=[t?t(e):xs(void 0,e),function(a){var l=n.__N?n.__N[0]:n.__[0],d=n.t(l,a);l!==d&&(n.__N=[d,n.__[1]],n.__c.setState({}))}],n.__c=O,!O.u)){var s=function(a,l,d){if(!n.__c.__H)return!0;var u=n.__c.__H.__.filter(function(f){return f.__c});if(u.every(function(f){return!f.__N}))return!o||o.call(this,a,l,d);var c=!1;return u.forEach(function(f){if(f.__N){var b=f.__[0];f.__=f.__N,f.__N=void 0,b!==f.__[0]&&(c=!0)}}),!(!c&&n.__c.props===a)&&(!o||o.call(this,a,l,d))};O.u=!0;var o=O.shouldComponentUpdate,r=O.componentWillUpdate;O.componentWillUpdate=function(a,l,d){if(this.__e){var u=o;o=void 0,s(a,l,d),o=u}r&&r.call(this,a,l,d)},O.shouldComponentUpdate=s}return n.__N||n.__}function Ni(i,e){var t=Xe(we++,3);!v.__s&&zi(t.__H,e)&&(t.__=i,t.i=e,O.__H.__h.push(t))}function Zt(i,e){var t=Xe(we++,4);!v.__s&&zi(t.__H,e)&&(t.__=i,t.i=e,O.__h.push(t))}function Do(i){return qe=5,Mi(function(){return{current:i}},[])}function Po(i,e,t){qe=6,Zt(function(){return typeof i=="function"?(i(e()),function(){return i(null)}):i?(i.current=e(),function(){return i.current=null}):void 0},t==null?t:t.concat(i))}function Mi(i,e){var t=Xe(we++,7);return zi(t.__H,e)?(t.__V=i(),t.i=e,t.__h=i,t.__V):t.__}function Bo(i,e){return qe=8,Mi(function(){return i},e)}function Fo(i){var e=O.context[i.__c],t=Xe(we++,9);return t.c=i,e?(t.__==null&&(t.__=!0,e.sub(O)),e.props.value):i.__}function Lo(i,e){v.useDebugValue&&v.useDebugValue(e?e(i):i)}function Ho(){var i=Xe(we++,11);if(!i.__){for(var e=O.__v;e!==null&&!e.__m&&e.__!==null;)e=e.__;var t=e.__m||(e.__m=[0,0]);i.__="P"+t[0]+"-"+t[1]++}return i.__}function Vo(){for(var i;i=vs.shift();)if(i.__P&&i.__H)try{i.__H.__h.forEach(Vt),i.__H.__h.forEach(Ii),i.__H.__h=[]}catch(e){i.__H.__h=[],v.__e(e,i.__v)}}v.__b=function(i){O=null,pn&&pn(i)},v.__r=function(i){fn&&fn(i),we=0;var e=(O=i.__c).__H;e&&(ai===O?(e.__h=[],O.__h=[],e.__.forEach(function(t){t.__N&&(t.__=t.__N),t.__V=Ht,t.__N=t.i=void 0})):(e.__h.forEach(Vt),e.__h.forEach(Ii),e.__h=[],we=0)),ai=O},v.diffed=function(i){bn&&bn(i);var e=i.__c;e&&e.__H&&(e.__H.__h.length&&(vs.push(e)!==1&&un===v.requestAnimationFrame||((un=v.requestAnimationFrame)||No)(Vo)),e.__H.__.forEach(function(t){t.i&&(t.__H=t.i),t.__V!==Ht&&(t.__=t.__V),t.i=void 0,t.__V=Ht})),ai=O=null},v.__c=function(i,e){e.some(function(t){try{t.__h.forEach(Vt),t.__h=t.__h.filter(function(n){return!n.__||Ii(n)})}catch(n){e.some(function(s){s.__h&&(s.__h=[])}),e=[],v.__e(n,t.__v)}}),mn&&mn(i,e)},v.unmount=function(i){gn&&gn(i);var e,t=i.__c;t&&t.__H&&(t.__H.__.forEach(function(n){try{Vt(n)}catch(s){e=s}}),t.__H=void 0,e&&v.__e(e,t.__v))};var vn=typeof requestAnimationFrame=="function";function No(i){var e,t=function(){clearTimeout(n),vn&&cancelAnimationFrame(e),setTimeout(i)},n=setTimeout(t,100);vn&&(e=requestAnimationFrame(t))}function Vt(i){var e=O,t=i.__c;typeof t=="function"&&(i.__c=void 0,t()),O=e}function Ii(i){var e=O;i.__c=i.__(),O=e}function zi(i,e){return!i||i.length!==e.length||e.some(function(t,n){return t!==i[n]})}function xs(i,e){return typeof e=="function"?e(i):e}function _s(i,e){for(var t in e)i[t]=e[t];return i}function Si(i,e){for(var t in i)if(t!=="__source"&&!(t in e))return!0;for(var n in e)if(n!=="__source"&&i[n]!==e[n])return!0;return!1}function Oi(i){this.props=i}function Mo(i,e){function t(s){var o=this.props.ref,r=o==s.ref;return!r&&o&&(o.call?o(null):o.current=null),e?!e(this.props,s)||!r:Si(this.props,s)}function n(s){return this.shouldComponentUpdate=t,me(i,s)}return n.displayName="Memo("+(i.displayName||i.name)+")",n.prototype.isReactComponent=!0,n.__f=!0,n}(Oi.prototype=new de).isPureReactComponent=!0,Oi.prototype.shouldComponentUpdate=function(i,e){return Si(this.props,i)||Si(this.state,e)};var yn=v.__b;v.__b=function(i){i.type&&i.type.__f&&i.ref&&(i.props.ref=i.ref,i.ref=null),yn&&yn(i)};var zo=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function jo(i){function e(t){var n=_s({},t);return delete n.ref,i(n,t.ref||null)}return e.$$typeof=zo,e.render=e,e.prototype.isReactComponent=e.__f=!0,e.displayName="ForwardRef("+(i.displayName||i.name)+")",e}var xn=function(i,e){return i==null?null:be(be(i).map(e))},Uo={map:xn,forEach:xn,count:function(i){return i?be(i).length:0},only:function(i){var e=be(i);if(e.length!==1)throw"Children.only";return e[0]},toArray:be},qo=v.__e;v.__e=function(i,e,t,n){if(i.then){for(var s,o=e;o=o.__;)if((s=o.__c)&&s.__c)return e.__e==null&&(e.__e=t.__e,e.__k=t.__k),s.__c(i,e)}qo(i,e,t,n)};var _n=v.unmount;function ws(i,e,t){return i&&(i.__c&&i.__c.__H&&(i.__c.__H.__.forEach(function(n){typeof n.__c=="function"&&n.__c()}),i.__c.__H=null),(i=_s({},i)).__c!=null&&(i.__c.__P===t&&(i.__c.__P=e),i.__c=null),i.__k=i.__k&&i.__k.map(function(n){return ws(n,e,t)})),i}function $s(i,e,t){return i&&t&&(i.__v=null,i.__k=i.__k&&i.__k.map(function(n){return $s(n,e,t)}),i.__c&&i.__c.__P===e&&(i.__e&&t.appendChild(i.__e),i.__c.__e=!0,i.__c.__P=t)),i}function Nt(){this.__u=0,this.t=null,this.__b=null}function Cs(i){var e=i.__.__c;return e&&e.__a&&e.__a(i)}function Wo(i){var e,t,n;function s(o){if(e||(e=i()).then(function(r){t=r.default||r},function(r){n=r}),n)throw n;if(!t)throw e;return me(t,o)}return s.displayName="Lazy",s.__f=!0,s}function lt(){this.u=null,this.o=null}v.unmount=function(i){var e=i.__c;e&&e.__R&&e.__R(),e&&32&i.__u&&(i.type=null),_n&&_n(i)},(Nt.prototype=new de).__c=function(i,e){var t=e.__c,n=this;n.t==null&&(n.t=[]),n.t.push(t);var s=Cs(n.__v),o=!1,r=function(){o||(o=!0,t.__R=null,s?s(a):a())};t.__R=r;var a=function(){if(!--n.__u){if(n.state.__a){var l=n.state.__a;n.__v.__k[0]=$s(l,l.__c.__P,l.__c.__O)}var d;for(n.setState({__a:n.__b=null});d=n.t.pop();)d.forceUpdate()}};n.__u++||32&e.__u||n.setState({__a:n.__b=n.__v.__k[0]}),i.then(r,r)},Nt.prototype.componentWillUnmount=function(){this.t=[]},Nt.prototype.render=function(i,e){if(this.__b){if(this.__v.__k){var t=document.createElement("div"),n=this.__v.__k[0].__c;this.__v.__k[0]=ws(this.__b,t,n.__O=n.__P)}this.__b=null}var s=e.__a&&me(ge,null,i.fallback);return s&&(s.__u&=-33),[me(ge,null,e.__a?null:i.children),s]};var wn=function(i,e,t){if(++t[1]===t[0]&&i.o.delete(e),i.props.revealOrder&&(i.props.revealOrder[0]!=="t"||!i.o.size))for(t=i.u;t;){for(;t.length>3;)t.pop()();if(t[1]<t[0])break;i.u=t=t[2]}};function Go(i){return this.getChildContext=function(){return i.context},i.children}function Qo(i){var e=this,t=i.i;e.componentWillUnmount=function(){bt(null,e.l),e.l=null,e.i=null},e.i&&e.i!==t&&e.componentWillUnmount(),e.l||(e.i=t,e.l={nodeType:1,parentNode:t,childNodes:[],appendChild:function(n){this.childNodes.push(n),e.i.appendChild(n)},insertBefore:function(n,s){this.childNodes.push(n),e.i.appendChild(n)},removeChild:function(n){this.childNodes.splice(this.childNodes.indexOf(n)>>>1,1),e.i.removeChild(n)}}),bt(me(Go,{context:e.context},i.__v),e.l)}function Xo(i,e){var t=me(Qo,{__v:i,i:e});return t.containerInfo=e,t}(lt.prototype=new de).__a=function(i){var e=this,t=Cs(e.__v),n=e.o.get(i);return n[0]++,function(s){var o=function(){e.props.revealOrder?(n.push(s),wn(e,i,n)):s()};t?t(o):o()}},lt.prototype.render=function(i){this.u=null,this.o=new Map;var e=be(i.children);i.revealOrder&&i.revealOrder[0]==="b"&&e.reverse();for(var t=e.length;t--;)this.o.set(e[t],this.u=[1,0,this.u]);return i.children},lt.prototype.componentDidUpdate=lt.prototype.componentDidMount=function(){var i=this;this.o.forEach(function(e,t){wn(i,t,e)})};var ks=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.element")||60103,Yo=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,Zo=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,Jo=/[A-Z0-9]/g,Ko=typeof document<"u",er=function(i){return(typeof Symbol<"u"&&typeof Symbol()=="symbol"?/fil|che|rad/:/fil|che|ra/).test(i)};function Ts(i,e,t){return e.__k==null&&(e.textContent=""),bt(i,e),typeof t=="function"&&t(),i?i.__c:null}function Is(i,e,t){return gs(i,e),typeof t=="function"&&t(),i?i.__c:null}de.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(i){Object.defineProperty(de.prototype,i,{configurable:!0,get:function(){return this["UNSAFE_"+i]},set:function(e){Object.defineProperty(this,i,{configurable:!0,writable:!0,value:e})}})});var $n=v.event;function tr(){}function ir(){return this.cancelBubble}function nr(){return this.defaultPrevented}v.event=function(i){return $n&&(i=$n(i)),i.persist=tr,i.isPropagationStopped=ir,i.isDefaultPrevented=nr,i.nativeEvent=i};var ji,sr={enumerable:!1,configurable:!0,get:function(){return this.class}},Cn=v.vnode;v.vnode=function(i){typeof i.type=="string"&&function(e){var t=e.props,n=e.type,s={};for(var o in t){var r=t[o];if(!(o==="value"&&"defaultValue"in t&&r==null||Ko&&o==="children"&&n==="noscript"||o==="class"||o==="className")){var a=o.toLowerCase();o==="defaultValue"&&"value"in t&&t.value==null?o="value":o==="download"&&r===!0?r="":a==="ondoubleclick"?o="ondblclick":a!=="onchange"||n!=="input"&&n!=="textarea"||er(t.type)?a==="onfocus"?o="onfocusin":a==="onblur"?o="onfocusout":Zo.test(o)?o=a:n.indexOf("-")===-1&&Yo.test(o)?o=o.replace(Jo,"-$&").toLowerCase():r===null&&(r=void 0):a=o="oninput",a==="oninput"&&s[o=a]&&(o="oninputCapture"),s[o]=r}}n=="select"&&s.multiple&&Array.isArray(s.value)&&(s.value=be(t.children).forEach(function(l){l.props.selected=s.value.indexOf(l.props.value)!=-1})),n=="select"&&s.defaultValue!=null&&(s.value=be(t.children).forEach(function(l){l.props.selected=s.multiple?s.defaultValue.indexOf(l.props.value)!=-1:s.defaultValue==l.props.value})),t.class&&!t.className?(s.class=t.class,Object.defineProperty(s,"className",sr)):(t.className&&!t.class||t.class&&t.className)&&(s.class=s.className=t.className),e.props=s}(i),i.$$typeof=ks,Cn&&Cn(i)};var kn=v.__r;v.__r=function(i){kn&&kn(i),ji=i.__c};var Tn=v.diffed;v.diffed=function(i){Tn&&Tn(i);var e=i.props,t=i.__e;t!=null&&i.type==="textarea"&&"value"in e&&e.value!==t.value&&(t.value=e.value==null?"":e.value),ji=null};var or={ReactCurrentDispatcher:{current:{readContext:function(i){return ji.__n[i.__c].props.value}}}};function rr(i){return me.bind(null,i)}function Jt(i){return!!i&&i.$$typeof===ks}function ar(i){return Jt(i)&&i.type===ge}function lr(i){return Jt(i)?Eo.apply(null,arguments):i}function Ss(i){return!!i.__k&&(bt(null,i),!0)}function cr(i){return i&&(i.base||i.nodeType===1&&i)||null}var dr=function(i,e){return i(e)},hr=function(i,e){return i(e)},ur=ge;function Os(i){i()}function pr(i){return i}function fr(){return[!1,Os]}var br=Zt,mr=Jt;function gr(i,e){var t=e(),n=Vi({h:{__:t,v:e}}),s=n[0].h,o=n[1];return Zt(function(){s.__=t,s.v=e,li(s)&&o({h:s})},[i,t,e]),Ni(function(){return li(s)&&o({h:s}),i(function(){li(s)&&o({h:s})})},[i]),t}function li(i){var e,t,n=i.v,s=i.__;try{var o=n();return!((e=s)===(t=o)&&(e!==0||1/e==1/t)||e!=e&&t!=t)}catch{return!0}}var Rs={useState:Vi,useId:Ho,useReducer:ys,useEffect:Ni,useLayoutEffect:Zt,useInsertionEffect:br,useTransition:fr,useDeferredValue:pr,useSyncExternalStore:gr,startTransition:Os,useRef:Do,useImperativeHandle:Po,useMemo:Mi,useCallback:Bo,useContext:Fo,useDebugValue:Lo,version:"17.0.2",Children:Uo,render:Ts,hydrate:Is,unmountComponentAtNode:Ss,createPortal:Xo,createElement:me,createContext:Ao,createFactory:rr,cloneElement:lr,createRef:To,Fragment:ge,isValidElement:Jt,isElement:mr,isFragment:ar,findDOMNode:cr,Component:de,PureComponent:Oi,memo:Mo,forwardRef:jo,flushSync:hr,unstable_batchedUpdates:dr,StrictMode:ur,Suspense:Nt,SuspenseList:lt,lazy:Wo,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:or},vr=0;function X(i,e,t,n,s,o){var r,a,l={};for(a in e)a=="ref"?r=e[a]:l[a]=e[a];var d={type:i,props:l,key:t,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:--vr,__i:-1,__u:0,__source:s,__self:o};if(typeof i=="function"&&(r=i.defaultProps))for(a in r)l[a]===void 0&&(l[a]=r[a]);return v.vnode&&v.vnode(d),d}function Es(i){return{render(e){Ts(e,i)},unmount(){Ss(i)}}}function yr(i,e){return Is(e,i),Es(i)}const xr={createRoot:Es,hydrateRoot:yr};const $e=function(){if(typeof globalThis<"u")return globalThis;if(typeof global<"u")return global;if(typeof self<"u")return self;if(typeof window<"u")return window;try{return new Function("return this")()}catch{return{}}}();$e.trustedTypes===void 0&&($e.trustedTypes={createPolicy:(i,e)=>e});const As={configurable:!1,enumerable:!1,writable:!1};$e.FAST===void 0&&Reflect.defineProperty($e,"FAST",Object.assign({value:Object.create(null)},As));const mt=$e.FAST;if(mt.getById===void 0){const i=Object.create(null);Reflect.defineProperty(mt,"getById",Object.assign({value(e,t){let n=i[e];return n===void 0&&(n=t?i[e]=t():null),n}},As))}const Ae=Object.freeze([]);function Ds(){const i=new WeakMap;return function(e){let t=i.get(e);if(t===void 0){let n=Reflect.getPrototypeOf(e);for(;t===void 0&&n!==null;)t=i.get(n),n=Reflect.getPrototypeOf(n);t=t===void 0?[]:t.slice(0),i.set(e,t)}return t}}const ci=$e.FAST.getById(1,()=>{const i=[],e=[];function t(){if(e.length)throw e.shift()}function n(r){try{r.call()}catch(a){e.push(a),setTimeout(t,0)}}function s(){let a=0;for(;a<i.length;)if(n(i[a]),a++,a>1024){for(let l=0,d=i.length-a;l<d;l++)i[l]=i[l+a];i.length-=a,a=0}i.length=0}function o(r){i.length<1&&$e.requestAnimationFrame(s),i.push(r)}return Object.freeze({enqueue:o,process:s})}),Ps=$e.trustedTypes.createPolicy("fast-html",{createHTML:i=>i});let di=Ps;const dt=`fast-${Math.random().toString(36).substring(2,8)}`,Bs=`${dt}{`,Ui=`}${dt}`,$=Object.freeze({supportsAdoptedStyleSheets:Array.isArray(document.adoptedStyleSheets)&&"replace"in CSSStyleSheet.prototype,setHTMLPolicy(i){if(di!==Ps)throw new Error("The HTML policy can only be set once.");di=i},createHTML(i){return di.createHTML(i)},isMarker(i){return i&&i.nodeType===8&&i.data.startsWith(dt)},extractDirectiveIndexFromMarker(i){return parseInt(i.data.replace(`${dt}:`,""))},createInterpolationPlaceholder(i){return`${Bs}${i}${Ui}`},createCustomAttributePlaceholder(i,e){return`${i}="${this.createInterpolationPlaceholder(e)}"`},createBlockPlaceholder(i){return`<!--${dt}:${i}-->`},queueUpdate:ci.enqueue,processUpdates:ci.process,nextUpdate(){return new Promise(ci.enqueue)},setAttribute(i,e,t){t==null?i.removeAttribute(e):i.setAttribute(e,t)},setBooleanAttribute(i,e,t){t?i.setAttribute(e,""):i.removeAttribute(e)},removeChildNodes(i){for(let e=i.firstChild;e!==null;e=i.firstChild)i.removeChild(e)},createTemplateWalker(i){return document.createTreeWalker(i,133,null,!1)}});class qt{constructor(e,t){this.sub1=void 0,this.sub2=void 0,this.spillover=void 0,this.source=e,this.sub1=t}has(e){return this.spillover===void 0?this.sub1===e||this.sub2===e:this.spillover.indexOf(e)!==-1}subscribe(e){const t=this.spillover;if(t===void 0){if(this.has(e))return;if(this.sub1===void 0){this.sub1=e;return}if(this.sub2===void 0){this.sub2=e;return}this.spillover=[this.sub1,this.sub2,e],this.sub1=void 0,this.sub2=void 0}else t.indexOf(e)===-1&&t.push(e)}unsubscribe(e){const t=this.spillover;if(t===void 0)this.sub1===e?this.sub1=void 0:this.sub2===e&&(this.sub2=void 0);else{const n=t.indexOf(e);n!==-1&&t.splice(n,1)}}notify(e){const t=this.spillover,n=this.source;if(t===void 0){const s=this.sub1,o=this.sub2;s!==void 0&&s.handleChange(n,e),o!==void 0&&o.handleChange(n,e)}else for(let s=0,o=t.length;s<o;++s)t[s].handleChange(n,e)}}class Fs{constructor(e){this.subscribers={},this.sourceSubscribers=null,this.source=e}notify(e){var t;const n=this.subscribers[e];n!==void 0&&n.notify(e),(t=this.sourceSubscribers)===null||t===void 0||t.notify(e)}subscribe(e,t){var n;if(t){let s=this.subscribers[t];s===void 0&&(this.subscribers[t]=s=new qt(this.source)),s.subscribe(e)}else this.sourceSubscribers=(n=this.sourceSubscribers)!==null&&n!==void 0?n:new qt(this.source),this.sourceSubscribers.subscribe(e)}unsubscribe(e,t){var n;if(t){const s=this.subscribers[t];s!==void 0&&s.unsubscribe(e)}else(n=this.sourceSubscribers)===null||n===void 0||n.unsubscribe(e)}}const w=mt.getById(2,()=>{const i=/(:|&&|\|\||if)/,e=new WeakMap,t=$.queueUpdate;let n,s=d=>{throw new Error("Must call enableArrayObservation before observing arrays.")};function o(d){let u=d.$fastController||e.get(d);return u===void 0&&(Array.isArray(d)?u=s(d):e.set(d,u=new Fs(d))),u}const r=Ds();class a{constructor(u){this.name=u,this.field=`_${u}`,this.callback=`${u}Changed`}getValue(u){return n!==void 0&&n.watch(u,this.name),u[this.field]}setValue(u,c){const f=this.field,b=u[f];if(b!==c){u[f]=c;const y=u[this.callback];typeof y=="function"&&y.call(u,b,c),o(u).notify(this.name)}}}class l extends qt{constructor(u,c,f=!1){super(u,c),this.binding=u,this.isVolatileBinding=f,this.needsRefresh=!0,this.needsQueue=!0,this.first=this,this.last=null,this.propertySource=void 0,this.propertyName=void 0,this.notifier=void 0,this.next=void 0}observe(u,c){this.needsRefresh&&this.last!==null&&this.disconnect();const f=n;n=this.needsRefresh?this:void 0,this.needsRefresh=this.isVolatileBinding;const b=this.binding(u,c);return n=f,b}disconnect(){if(this.last!==null){let u=this.first;for(;u!==void 0;)u.notifier.unsubscribe(this,u.propertyName),u=u.next;this.last=null,this.needsRefresh=this.needsQueue=!0}}watch(u,c){const f=this.last,b=o(u),y=f===null?this.first:{};if(y.propertySource=u,y.propertyName=c,y.notifier=b,b.subscribe(this,c),f!==null){if(!this.needsRefresh){let T;n=void 0,T=f.propertySource[f.propertyName],n=this,u===T&&(this.needsRefresh=!0)}f.next=y}this.last=y}handleChange(){this.needsQueue&&(this.needsQueue=!1,t(this))}call(){this.last!==null&&(this.needsQueue=!0,this.notify(this))}records(){let u=this.first;return{next:()=>{const c=u;return c===void 0?{value:void 0,done:!0}:(u=u.next,{value:c,done:!1})},[Symbol.iterator]:function(){return this}}}}return Object.freeze({setArrayObserverFactory(d){s=d},getNotifier:o,track(d,u){n!==void 0&&n.watch(d,u)},trackVolatile(){n!==void 0&&(n.needsRefresh=!0)},notify(d,u){o(d).notify(u)},defineProperty(d,u){typeof u=="string"&&(u=new a(u)),r(d).push(u),Reflect.defineProperty(d,u.name,{enumerable:!0,get:function(){return u.getValue(this)},set:function(c){u.setValue(this,c)}})},getAccessors:r,binding(d,u,c=this.isVolatileBinding(d)){return new l(d,u,c)},isVolatileBinding(d){return i.test(d.toString())}})});function g(i,e){w.defineProperty(i,e)}function _r(i,e,t){return Object.assign({},t,{get:function(){return w.trackVolatile(),t.get.apply(this)}})}const In=mt.getById(3,()=>{let i=null;return{get(){return i},set(e){i=e}}});class gt{constructor(){this.index=0,this.length=0,this.parent=null,this.parentContext=null}get event(){return In.get()}get isEven(){return this.index%2===0}get isOdd(){return this.index%2!==0}get isFirst(){return this.index===0}get isInMiddle(){return!this.isFirst&&!this.isLast}get isLast(){return this.index===this.length-1}static setEvent(e){In.set(e)}}w.defineProperty(gt.prototype,"index");w.defineProperty(gt.prototype,"length");const ht=Object.seal(new gt);class Kt{constructor(){this.targetIndex=0}}class Ls extends Kt{constructor(){super(...arguments),this.createPlaceholder=$.createInterpolationPlaceholder}}class qi extends Kt{constructor(e,t,n){super(),this.name=e,this.behavior=t,this.options=n}createPlaceholder(e){return $.createCustomAttributePlaceholder(this.name,e)}createBehavior(e){return new this.behavior(e,this.options)}}function wr(i,e){this.source=i,this.context=e,this.bindingObserver===null&&(this.bindingObserver=w.binding(this.binding,this,this.isBindingVolatile)),this.updateTarget(this.bindingObserver.observe(i,e))}function $r(i,e){this.source=i,this.context=e,this.target.addEventListener(this.targetName,this)}function Cr(){this.bindingObserver.disconnect(),this.source=null,this.context=null}function kr(){this.bindingObserver.disconnect(),this.source=null,this.context=null;const i=this.target.$fastView;i!==void 0&&i.isComposed&&(i.unbind(),i.needsBindOnly=!0)}function Tr(){this.target.removeEventListener(this.targetName,this),this.source=null,this.context=null}function Ir(i){$.setAttribute(this.target,this.targetName,i)}function Sr(i){$.setBooleanAttribute(this.target,this.targetName,i)}function Or(i){if(i==null&&(i=""),i.create){this.target.textContent="";let e=this.target.$fastView;e===void 0?e=i.create():this.target.$fastTemplate!==i&&(e.isComposed&&(e.remove(),e.unbind()),e=i.create()),e.isComposed?e.needsBindOnly&&(e.needsBindOnly=!1,e.bind(this.source,this.context)):(e.isComposed=!0,e.bind(this.source,this.context),e.insertBefore(this.target),this.target.$fastView=e,this.target.$fastTemplate=i)}else{const e=this.target.$fastView;e!==void 0&&e.isComposed&&(e.isComposed=!1,e.remove(),e.needsBindOnly?e.needsBindOnly=!1:e.unbind()),this.target.textContent=i}}function Rr(i){this.target[this.targetName]=i}function Er(i){const e=this.classVersions||Object.create(null),t=this.target;let n=this.version||0;if(i!=null&&i.length){const s=i.split(/\s+/);for(let o=0,r=s.length;o<r;++o){const a=s[o];a!==""&&(e[a]=n,t.classList.add(a))}}if(this.classVersions=e,this.version=n+1,n!==0){n-=1;for(const s in e)e[s]===n&&t.classList.remove(s)}}class Wi extends Ls{constructor(e){super(),this.binding=e,this.bind=wr,this.unbind=Cr,this.updateTarget=Ir,this.isBindingVolatile=w.isVolatileBinding(this.binding)}get targetName(){return this.originalTargetName}set targetName(e){if(this.originalTargetName=e,e!==void 0)switch(e[0]){case":":if(this.cleanedTargetName=e.substr(1),this.updateTarget=Rr,this.cleanedTargetName==="innerHTML"){const t=this.binding;this.binding=(n,s)=>$.createHTML(t(n,s))}break;case"?":this.cleanedTargetName=e.substr(1),this.updateTarget=Sr;break;case"@":this.cleanedTargetName=e.substr(1),this.bind=$r,this.unbind=Tr;break;default:this.cleanedTargetName=e,e==="class"&&(this.updateTarget=Er);break}}targetAtContent(){this.updateTarget=Or,this.unbind=kr}createBehavior(e){return new Ar(e,this.binding,this.isBindingVolatile,this.bind,this.unbind,this.updateTarget,this.cleanedTargetName)}}class Ar{constructor(e,t,n,s,o,r,a){this.source=null,this.context=null,this.bindingObserver=null,this.target=e,this.binding=t,this.isBindingVolatile=n,this.bind=s,this.unbind=o,this.updateTarget=r,this.targetName=a}handleChange(){this.updateTarget(this.bindingObserver.observe(this.source,this.context))}handleEvent(e){gt.setEvent(e);const t=this.binding(this.source,this.context);gt.setEvent(null),t!==!0&&e.preventDefault()}}let hi=null;class Gi{addFactory(e){e.targetIndex=this.targetIndex,this.behaviorFactories.push(e)}captureContentBinding(e){e.targetAtContent(),this.addFactory(e)}reset(){this.behaviorFactories=[],this.targetIndex=-1}release(){hi=this}static borrow(e){const t=hi||new Gi;return t.directives=e,t.reset(),hi=null,t}}function Dr(i){if(i.length===1)return i[0];let e;const t=i.length,n=i.map(r=>typeof r=="string"?()=>r:(e=r.targetName||e,r.binding)),s=(r,a)=>{let l="";for(let d=0;d<t;++d)l+=n[d](r,a);return l},o=new Wi(s);return o.targetName=e,o}const Pr=Ui.length;function Hs(i,e){const t=e.split(Bs);if(t.length===1)return null;const n=[];for(let s=0,o=t.length;s<o;++s){const r=t[s],a=r.indexOf(Ui);let l;if(a===-1)l=r;else{const d=parseInt(r.substring(0,a));n.push(i.directives[d]),l=r.substring(a+Pr)}l!==""&&n.push(l)}return n}function Sn(i,e,t=!1){const n=e.attributes;for(let s=0,o=n.length;s<o;++s){const r=n[s],a=r.value,l=Hs(i,a);let d=null;l===null?t&&(d=new Wi(()=>a),d.targetName=r.name):d=Dr(l),d!==null&&(e.removeAttributeNode(r),s--,o--,i.addFactory(d))}}function Br(i,e,t){const n=Hs(i,e.textContent);if(n!==null){let s=e;for(let o=0,r=n.length;o<r;++o){const a=n[o],l=o===0?e:s.parentNode.insertBefore(document.createTextNode(""),s.nextSibling);typeof a=="string"?l.textContent=a:(l.textContent=" ",i.captureContentBinding(a)),s=l,i.targetIndex++,l!==e&&t.nextNode()}i.targetIndex--}}function Fr(i,e){const t=i.content;document.adoptNode(t);const n=Gi.borrow(e);Sn(n,i,!0);const s=n.behaviorFactories;n.reset();const o=$.createTemplateWalker(t);let r;for(;r=o.nextNode();)switch(n.targetIndex++,r.nodeType){case 1:Sn(n,r);break;case 3:Br(n,r,o);break;case 8:$.isMarker(r)&&n.addFactory(e[$.extractDirectiveIndexFromMarker(r)])}let a=0;($.isMarker(t.firstChild)||t.childNodes.length===1&&e.length)&&(t.insertBefore(document.createComment(""),t.firstChild),a=-1);const l=n.behaviorFactories;return n.release(),{fragment:t,viewBehaviorFactories:l,hostBehaviorFactories:s,targetOffset:a}}const ui=document.createRange();class Vs{constructor(e,t){this.fragment=e,this.behaviors=t,this.source=null,this.context=null,this.firstChild=e.firstChild,this.lastChild=e.lastChild}appendTo(e){e.appendChild(this.fragment)}insertBefore(e){if(this.fragment.hasChildNodes())e.parentNode.insertBefore(this.fragment,e);else{const t=this.lastChild;if(e.previousSibling===t)return;const n=e.parentNode;let s=this.firstChild,o;for(;s!==t;)o=s.nextSibling,n.insertBefore(s,e),s=o;n.insertBefore(t,e)}}remove(){const e=this.fragment,t=this.lastChild;let n=this.firstChild,s;for(;n!==t;)s=n.nextSibling,e.appendChild(n),n=s;e.appendChild(t)}dispose(){const e=this.firstChild.parentNode,t=this.lastChild;let n=this.firstChild,s;for(;n!==t;)s=n.nextSibling,e.removeChild(n),n=s;e.removeChild(t);const o=this.behaviors,r=this.source;for(let a=0,l=o.length;a<l;++a)o[a].unbind(r)}bind(e,t){const n=this.behaviors;if(this.source!==e)if(this.source!==null){const s=this.source;this.source=e,this.context=t;for(let o=0,r=n.length;o<r;++o){const a=n[o];a.unbind(s),a.bind(e,t)}}else{this.source=e,this.context=t;for(let s=0,o=n.length;s<o;++s)n[s].bind(e,t)}}unbind(){if(this.source===null)return;const e=this.behaviors,t=this.source;for(let n=0,s=e.length;n<s;++n)e[n].unbind(t);this.source=null}static disposeContiguousBatch(e){if(e.length!==0){ui.setStartBefore(e[0].firstChild),ui.setEndAfter(e[e.length-1].lastChild),ui.deleteContents();for(let t=0,n=e.length;t<n;++t){const s=e[t],o=s.behaviors,r=s.source;for(let a=0,l=o.length;a<l;++a)o[a].unbind(r)}}}}class On{constructor(e,t){this.behaviorCount=0,this.hasHostBehaviors=!1,this.fragment=null,this.targetOffset=0,this.viewBehaviorFactories=null,this.hostBehaviorFactories=null,this.html=e,this.directives=t}create(e){if(this.fragment===null){let d;const u=this.html;if(typeof u=="string"){d=document.createElement("template"),d.innerHTML=$.createHTML(u);const f=d.content.firstElementChild;f!==null&&f.tagName==="TEMPLATE"&&(d=f)}else d=u;const c=Fr(d,this.directives);this.fragment=c.fragment,this.viewBehaviorFactories=c.viewBehaviorFactories,this.hostBehaviorFactories=c.hostBehaviorFactories,this.targetOffset=c.targetOffset,this.behaviorCount=this.viewBehaviorFactories.length+this.hostBehaviorFactories.length,this.hasHostBehaviors=this.hostBehaviorFactories.length>0}const t=this.fragment.cloneNode(!0),n=this.viewBehaviorFactories,s=new Array(this.behaviorCount),o=$.createTemplateWalker(t);let r=0,a=this.targetOffset,l=o.nextNode();for(let d=n.length;r<d;++r){const u=n[r],c=u.targetIndex;for(;l!==null;)if(a===c){s[r]=u.createBehavior(l);break}else l=o.nextNode(),a++}if(this.hasHostBehaviors){const d=this.hostBehaviorFactories;for(let u=0,c=d.length;u<c;++u,++r)s[r]=d[u].createBehavior(e)}return new Vs(t,s)}render(e,t,n){typeof t=="string"&&(t=document.getElementById(t)),n===void 0&&(n=t);const s=this.create(n);return s.bind(e,ht),s.appendTo(t),s}}const Lr=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function S(i,...e){const t=[];let n="";for(let s=0,o=i.length-1;s<o;++s){const r=i[s];let a=e[s];if(n+=r,a instanceof On){const l=a;a=()=>l}if(typeof a=="function"&&(a=new Wi(a)),a instanceof Ls){const l=Lr.exec(r);l!==null&&(a.targetName=l[2])}a instanceof Kt?(n+=a.createPlaceholder(t.length),t.push(a)):n+=a}return n+=i[i.length-1],new On(n,t)}class Y{constructor(){this.targets=new WeakSet}addStylesTo(e){this.targets.add(e)}removeStylesFrom(e){this.targets.delete(e)}isAttachedTo(e){return this.targets.has(e)}withBehaviors(...e){return this.behaviors=this.behaviors===null?e:this.behaviors.concat(e),this}}Y.create=(()=>{if($.supportsAdoptedStyleSheets){const i=new Map;return e=>new Hr(e,i)}return i=>new Mr(i)})();function Qi(i){return i.map(e=>e instanceof Y?Qi(e.styles):[e]).reduce((e,t)=>e.concat(t),[])}function Ns(i){return i.map(e=>e instanceof Y?e.behaviors:null).reduce((e,t)=>t===null?e:(e===null&&(e=[]),e.concat(t)),null)}let Ms=(i,e)=>{i.adoptedStyleSheets=[...i.adoptedStyleSheets,...e]},zs=(i,e)=>{i.adoptedStyleSheets=i.adoptedStyleSheets.filter(t=>e.indexOf(t)===-1)};if($.supportsAdoptedStyleSheets)try{document.adoptedStyleSheets.push(),document.adoptedStyleSheets.splice(),Ms=(i,e)=>{i.adoptedStyleSheets.push(...e)},zs=(i,e)=>{for(const t of e){const n=i.adoptedStyleSheets.indexOf(t);n!==-1&&i.adoptedStyleSheets.splice(n,1)}}}catch{}class Hr extends Y{constructor(e,t){super(),this.styles=e,this.styleSheetCache=t,this._styleSheets=void 0,this.behaviors=Ns(e)}get styleSheets(){if(this._styleSheets===void 0){const e=this.styles,t=this.styleSheetCache;this._styleSheets=Qi(e).map(n=>{if(n instanceof CSSStyleSheet)return n;let s=t.get(n);return s===void 0&&(s=new CSSStyleSheet,s.replaceSync(n),t.set(n,s)),s})}return this._styleSheets}addStylesTo(e){Ms(e,this.styleSheets),super.addStylesTo(e)}removeStylesFrom(e){zs(e,this.styleSheets),super.removeStylesFrom(e)}}let Vr=0;function Nr(){return`fast-style-class-${++Vr}`}class Mr extends Y{constructor(e){super(),this.styles=e,this.behaviors=null,this.behaviors=Ns(e),this.styleSheets=Qi(e),this.styleClass=Nr()}addStylesTo(e){const t=this.styleSheets,n=this.styleClass;e=this.normalizeTarget(e);for(let s=0;s<t.length;s++){const o=document.createElement("style");o.innerHTML=t[s],o.className=n,e.append(o)}super.addStylesTo(e)}removeStylesFrom(e){e=this.normalizeTarget(e);const t=e.querySelectorAll(`.${this.styleClass}`);for(let n=0,s=t.length;n<s;++n)e.removeChild(t[n]);super.removeStylesFrom(e)}isAttachedTo(e){return super.isAttachedTo(this.normalizeTarget(e))}normalizeTarget(e){return e===document?document.body:e}}const Wt=Object.freeze({locate:Ds()}),js={toView(i){return i?"true":"false"},fromView(i){return!(i==null||i==="false"||i===!1||i===0)}},ae={toView(i){if(i==null)return null;const e=i*1;return isNaN(e)?null:e.toString()},fromView(i){if(i==null)return null;const e=i*1;return isNaN(e)?null:e}};class Gt{constructor(e,t,n=t.toLowerCase(),s="reflect",o){this.guards=new Set,this.Owner=e,this.name=t,this.attribute=n,this.mode=s,this.converter=o,this.fieldName=`_${t}`,this.callbackName=`${t}Changed`,this.hasCallback=this.callbackName in e.prototype,s==="boolean"&&o===void 0&&(this.converter=js)}setValue(e,t){const n=e[this.fieldName],s=this.converter;s!==void 0&&(t=s.fromView(t)),n!==t&&(e[this.fieldName]=t,this.tryReflectToAttribute(e),this.hasCallback&&e[this.callbackName](n,t),e.$fastController.notify(this.name))}getValue(e){return w.track(e,this.name),e[this.fieldName]}onAttributeChangedCallback(e,t){this.guards.has(e)||(this.guards.add(e),this.setValue(e,t),this.guards.delete(e))}tryReflectToAttribute(e){const t=this.mode,n=this.guards;n.has(e)||t==="fromView"||$.queueUpdate(()=>{n.add(e);const s=e[this.fieldName];switch(t){case"reflect":const o=this.converter;$.setAttribute(e,this.attribute,o!==void 0?o.toView(s):s);break;case"boolean":$.setBooleanAttribute(e,this.attribute,s);break}n.delete(e)})}static collect(e,...t){const n=[];t.push(Wt.locate(e));for(let s=0,o=t.length;s<o;++s){const r=t[s];if(r!==void 0)for(let a=0,l=r.length;a<l;++a){const d=r[a];typeof d=="string"?n.push(new Gt(e,d)):n.push(new Gt(e,d.property,d.attribute,d.mode,d.converter))}}return n}}function p(i,e){let t;function n(s,o){arguments.length>1&&(t.property=o),Wt.locate(s.constructor).push(t)}if(arguments.length>1){t={},n(i,e);return}return t=i===void 0?{}:i,n}const Rn={mode:"open"},En={},Ri=mt.getById(4,()=>{const i=new Map;return Object.freeze({register(e){return i.has(e.type)?!1:(i.set(e.type,e),!0)},getByType(e){return i.get(e)}})});class wt{constructor(e,t=e.definition){typeof t=="string"&&(t={name:t}),this.type=e,this.name=t.name,this.template=t.template;const n=Gt.collect(e,t.attributes),s=new Array(n.length),o={},r={};for(let a=0,l=n.length;a<l;++a){const d=n[a];s[a]=d.attribute,o[d.name]=d,r[d.attribute]=d}this.attributes=n,this.observedAttributes=s,this.propertyLookup=o,this.attributeLookup=r,this.shadowOptions=t.shadowOptions===void 0?Rn:t.shadowOptions===null?void 0:Object.assign(Object.assign({},Rn),t.shadowOptions),this.elementOptions=t.elementOptions===void 0?En:Object.assign(Object.assign({},En),t.elementOptions),this.styles=t.styles===void 0?void 0:Array.isArray(t.styles)?Y.create(t.styles):t.styles instanceof Y?t.styles:Y.create([t.styles])}get isDefined(){return!!Ri.getByType(this.type)}define(e=customElements){const t=this.type;if(Ri.register(this)){const n=this.attributes,s=t.prototype;for(let o=0,r=n.length;o<r;++o)w.defineProperty(s,n[o]);Reflect.defineProperty(t,"observedAttributes",{value:this.observedAttributes,enumerable:!0})}return e.get(this.name)||e.define(this.name,t,this.elementOptions),this}}wt.forType=Ri.getByType;const Us=new WeakMap,zr={bubbles:!0,composed:!0,cancelable:!0};function pi(i){return i.shadowRoot||Us.get(i)||null}class Xi extends Fs{constructor(e,t){super(e),this.boundObservables=null,this.behaviors=null,this.needsInitialization=!0,this._template=null,this._styles=null,this._isConnected=!1,this.$fastController=this,this.view=null,this.element=e,this.definition=t;const n=t.shadowOptions;if(n!==void 0){const o=e.attachShadow(n);n.mode==="closed"&&Us.set(e,o)}const s=w.getAccessors(e);if(s.length>0){const o=this.boundObservables=Object.create(null);for(let r=0,a=s.length;r<a;++r){const l=s[r].name,d=e[l];d!==void 0&&(delete e[l],o[l]=d)}}}get isConnected(){return w.track(this,"isConnected"),this._isConnected}setIsConnected(e){this._isConnected=e,w.notify(this,"isConnected")}get template(){return this._template}set template(e){this._template!==e&&(this._template=e,this.needsInitialization||this.renderTemplate(e))}get styles(){return this._styles}set styles(e){this._styles!==e&&(this._styles!==null&&this.removeStyles(this._styles),this._styles=e,!this.needsInitialization&&e!==null&&this.addStyles(e))}addStyles(e){const t=pi(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.append(e);else if(!e.isAttachedTo(t)){const n=e.behaviors;e.addStylesTo(t),n!==null&&this.addBehaviors(n)}}removeStyles(e){const t=pi(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.removeChild(e);else if(e.isAttachedTo(t)){const n=e.behaviors;e.removeStylesFrom(t),n!==null&&this.removeBehaviors(n)}}addBehaviors(e){const t=this.behaviors||(this.behaviors=new Map),n=e.length,s=[];for(let o=0;o<n;++o){const r=e[o];t.has(r)?t.set(r,t.get(r)+1):(t.set(r,1),s.push(r))}if(this._isConnected){const o=this.element;for(let r=0;r<s.length;++r)s[r].bind(o,ht)}}removeBehaviors(e,t=!1){const n=this.behaviors;if(n===null)return;const s=e.length,o=[];for(let r=0;r<s;++r){const a=e[r];if(n.has(a)){const l=n.get(a)-1;l===0||t?n.delete(a)&&o.push(a):n.set(a,l)}}if(this._isConnected){const r=this.element;for(let a=0;a<o.length;++a)o[a].unbind(r)}}onConnectedCallback(){if(this._isConnected)return;const e=this.element;this.needsInitialization?this.finishInitialization():this.view!==null&&this.view.bind(e,ht);const t=this.behaviors;if(t!==null)for(const[n]of t)n.bind(e,ht);this.setIsConnected(!0)}onDisconnectedCallback(){if(!this._isConnected)return;this.setIsConnected(!1);const e=this.view;e!==null&&e.unbind();const t=this.behaviors;if(t!==null){const n=this.element;for(const[s]of t)s.unbind(n)}}onAttributeChangedCallback(e,t,n){const s=this.definition.attributeLookup[e];s!==void 0&&s.onAttributeChangedCallback(this.element,n)}emit(e,t,n){return this._isConnected?this.element.dispatchEvent(new CustomEvent(e,Object.assign(Object.assign({detail:t},zr),n))):!1}finishInitialization(){const e=this.element,t=this.boundObservables;if(t!==null){const s=Object.keys(t);for(let o=0,r=s.length;o<r;++o){const a=s[o];e[a]=t[a]}this.boundObservables=null}const n=this.definition;this._template===null&&(this.element.resolveTemplate?this._template=this.element.resolveTemplate():n.template&&(this._template=n.template||null)),this._template!==null&&this.renderTemplate(this._template),this._styles===null&&(this.element.resolveStyles?this._styles=this.element.resolveStyles():n.styles&&(this._styles=n.styles||null)),this._styles!==null&&this.addStyles(this._styles),this.needsInitialization=!1}renderTemplate(e){const t=this.element,n=pi(t)||t;this.view!==null?(this.view.dispose(),this.view=null):this.needsInitialization||$.removeChildNodes(n),e&&(this.view=e.render(t,n,t))}static forCustomElement(e){const t=e.$fastController;if(t!==void 0)return t;const n=wt.forType(e.constructor);if(n===void 0)throw new Error("Missing FASTElement definition.");return e.$fastController=new Xi(e,n)}}function An(i){return class extends i{constructor(){super(),Xi.forCustomElement(this)}$emit(e,t,n){return this.$fastController.emit(e,t,n)}connectedCallback(){this.$fastController.onConnectedCallback()}disconnectedCallback(){this.$fastController.onDisconnectedCallback()}attributeChangedCallback(e,t,n){this.$fastController.onAttributeChangedCallback(e,t,n)}}}const ei=Object.assign(An(HTMLElement),{from(i){return An(i)},define(i,e){return new wt(i,e).define().type}});class qs{createCSS(){return""}createBehavior(){}}function jr(i,e){const t=[];let n="";const s=[];for(let o=0,r=i.length-1;o<r;++o){n+=i[o];let a=e[o];if(a instanceof qs){const l=a.createBehavior();a=a.createCSS(),l&&s.push(l)}a instanceof Y||a instanceof CSSStyleSheet?(n.trim()!==""&&(t.push(n),n=""),t.push(a)):n+=a}return n+=i[i.length-1],n.trim()!==""&&t.push(n),{styles:t,behaviors:s}}function D(i,...e){const{styles:t,behaviors:n}=jr(i,e),s=Y.create(t);return n.length&&s.withBehaviors(...n),s}function re(i,e,t){return{index:i,removed:e,addedCount:t}}const Ws=0,Gs=1,Ei=2,Ai=3;function Ur(i,e,t,n,s,o){const r=o-s+1,a=t-e+1,l=new Array(r);let d,u;for(let c=0;c<r;++c)l[c]=new Array(a),l[c][0]=c;for(let c=0;c<a;++c)l[0][c]=c;for(let c=1;c<r;++c)for(let f=1;f<a;++f)i[e+f-1]===n[s+c-1]?l[c][f]=l[c-1][f-1]:(d=l[c-1][f]+1,u=l[c][f-1]+1,l[c][f]=d<u?d:u);return l}function qr(i){let e=i.length-1,t=i[0].length-1,n=i[e][t];const s=[];for(;e>0||t>0;){if(e===0){s.push(Ei),t--;continue}if(t===0){s.push(Ai),e--;continue}const o=i[e-1][t-1],r=i[e-1][t],a=i[e][t-1];let l;r<a?l=r<o?r:o:l=a<o?a:o,l===o?(o===n?s.push(Ws):(s.push(Gs),n=o),e--,t--):l===r?(s.push(Ai),e--,n=r):(s.push(Ei),t--,n=a)}return s.reverse(),s}function Wr(i,e,t){for(let n=0;n<t;++n)if(i[n]!==e[n])return n;return t}function Gr(i,e,t){let n=i.length,s=e.length,o=0;for(;o<t&&i[--n]===e[--s];)o++;return o}function Qr(i,e,t,n){return e<t||n<i?-1:e===t||n===i?0:i<t?e<n?e-t:n-t:n<e?n-i:e-i}function Qs(i,e,t,n,s,o){let r=0,a=0;const l=Math.min(t-e,o-s);if(e===0&&s===0&&(r=Wr(i,n,l)),t===i.length&&o===n.length&&(a=Gr(i,n,l-r)),e+=r,s+=r,t-=a,o-=a,t-e===0&&o-s===0)return Ae;if(e===t){const y=re(e,[],0);for(;s<o;)y.removed.push(n[s++]);return[y]}else if(s===o)return[re(e,[],t-e)];const d=qr(Ur(i,e,t,n,s,o)),u=[];let c,f=e,b=s;for(let y=0;y<d.length;++y)switch(d[y]){case Ws:c!==void 0&&(u.push(c),c=void 0),f++,b++;break;case Gs:c===void 0&&(c=re(f,[],0)),c.addedCount++,f++,c.removed.push(n[b]),b++;break;case Ei:c===void 0&&(c=re(f,[],0)),c.addedCount++,f++;break;case Ai:c===void 0&&(c=re(f,[],0)),c.removed.push(n[b]),b++;break}return c!==void 0&&u.push(c),u}const Dn=Array.prototype.push;function Xr(i,e,t,n){const s=re(e,t,n);let o=!1,r=0;for(let a=0;a<i.length;a++){const l=i[a];if(l.index+=r,o)continue;const d=Qr(s.index,s.index+s.removed.length,l.index,l.index+l.addedCount);if(d>=0){i.splice(a,1),a--,r-=l.addedCount-l.removed.length,s.addedCount+=l.addedCount-d;const u=s.removed.length+l.removed.length-d;if(!s.addedCount&&!u)o=!0;else{let c=l.removed;if(s.index<l.index){const f=s.removed.slice(0,l.index-s.index);Dn.apply(f,c),c=f}if(s.index+s.removed.length>l.index+l.addedCount){const f=s.removed.slice(l.index+l.addedCount-s.index);Dn.apply(c,f)}s.removed=c,l.index<s.index&&(s.index=l.index)}}else if(s.index<l.index){o=!0,i.splice(a,0,s),a++;const u=s.addedCount-s.removed.length;l.index+=u,r+=u}}o||i.push(s)}function Yr(i){const e=[];for(let t=0,n=i.length;t<n;t++){const s=i[t];Xr(e,s.index,s.removed,s.addedCount)}return e}function Zr(i,e){let t=[];const n=Yr(e);for(let s=0,o=n.length;s<o;++s){const r=n[s];if(r.addedCount===1&&r.removed.length===1){r.removed[0]!==i[r.index]&&t.push(r);continue}t=t.concat(Qs(i,r.index,r.index+r.addedCount,r.removed,0,r.removed.length))}return t}let Pn=!1;function fi(i,e){let t=i.index;const n=e.length;return t>n?t=n-i.addedCount:t<0&&(t=n+i.removed.length+t-i.addedCount),t<0&&(t=0),i.index=t,i}class Jr extends qt{constructor(e){super(e),this.oldCollection=void 0,this.splices=void 0,this.needsQueue=!0,this.call=this.flush,Reflect.defineProperty(e,"$fastController",{value:this,enumerable:!1})}subscribe(e){this.flush(),super.subscribe(e)}addSplice(e){this.splices===void 0?this.splices=[e]:this.splices.push(e),this.needsQueue&&(this.needsQueue=!1,$.queueUpdate(this))}reset(e){this.oldCollection=e,this.needsQueue&&(this.needsQueue=!1,$.queueUpdate(this))}flush(){const e=this.splices,t=this.oldCollection;if(e===void 0&&t===void 0)return;this.needsQueue=!0,this.splices=void 0,this.oldCollection=void 0;const n=t===void 0?Zr(this.source,e):Qs(this.source,0,this.source.length,t,0,t.length);this.notify(n)}}function Kr(){if(Pn)return;Pn=!0,w.setArrayObserverFactory(l=>new Jr(l));const i=Array.prototype;if(i.$fastPatch)return;Reflect.defineProperty(i,"$fastPatch",{value:1,enumerable:!1});const e=i.pop,t=i.push,n=i.reverse,s=i.shift,o=i.sort,r=i.splice,a=i.unshift;i.pop=function(){const l=this.length>0,d=e.apply(this,arguments),u=this.$fastController;return u!==void 0&&l&&u.addSplice(re(this.length,[d],0)),d},i.push=function(){const l=t.apply(this,arguments),d=this.$fastController;return d!==void 0&&d.addSplice(fi(re(this.length-arguments.length,[],arguments.length),this)),l},i.reverse=function(){let l;const d=this.$fastController;d!==void 0&&(d.flush(),l=this.slice());const u=n.apply(this,arguments);return d!==void 0&&d.reset(l),u},i.shift=function(){const l=this.length>0,d=s.apply(this,arguments),u=this.$fastController;return u!==void 0&&l&&u.addSplice(re(0,[d],0)),d},i.sort=function(){let l;const d=this.$fastController;d!==void 0&&(d.flush(),l=this.slice());const u=o.apply(this,arguments);return d!==void 0&&d.reset(l),u},i.splice=function(){const l=r.apply(this,arguments),d=this.$fastController;return d!==void 0&&d.addSplice(fi(re(+arguments[0],l,arguments.length>2?arguments.length-2:0),this)),l},i.unshift=function(){const l=a.apply(this,arguments),d=this.$fastController;return d!==void 0&&d.addSplice(fi(re(0,[],arguments.length),this)),l}}class ea{constructor(e,t){this.target=e,this.propertyName=t}bind(e){e[this.propertyName]=this.target}unbind(){}}function W(i){return new qi("fast-ref",ea,i)}const Xs=i=>typeof i=="function",ta=()=>null;function Bn(i){return i===void 0?ta:Xs(i)?i:()=>i}function Yi(i,e,t){const n=Xs(i)?i:()=>i,s=Bn(e),o=Bn(t);return(r,a)=>n(r,a)?s(r,a):o(r,a)}function ia(i,e,t,n){i.bind(e[t],n)}function na(i,e,t,n){const s=Object.create(n);s.index=t,s.length=e.length,i.bind(e[t],s)}class sa{constructor(e,t,n,s,o,r){this.location=e,this.itemsBinding=t,this.templateBinding=s,this.options=r,this.source=null,this.views=[],this.items=null,this.itemsObserver=null,this.originalContext=void 0,this.childContext=void 0,this.bindView=ia,this.itemsBindingObserver=w.binding(t,this,n),this.templateBindingObserver=w.binding(s,this,o),r.positioning&&(this.bindView=na)}bind(e,t){this.source=e,this.originalContext=t,this.childContext=Object.create(t),this.childContext.parent=e,this.childContext.parentContext=this.originalContext,this.items=this.itemsBindingObserver.observe(e,this.originalContext),this.template=this.templateBindingObserver.observe(e,this.originalContext),this.observeItems(!0),this.refreshAllViews()}unbind(){this.source=null,this.items=null,this.itemsObserver!==null&&this.itemsObserver.unsubscribe(this),this.unbindAllViews(),this.itemsBindingObserver.disconnect(),this.templateBindingObserver.disconnect()}handleChange(e,t){e===this.itemsBinding?(this.items=this.itemsBindingObserver.observe(this.source,this.originalContext),this.observeItems(),this.refreshAllViews()):e===this.templateBinding?(this.template=this.templateBindingObserver.observe(this.source,this.originalContext),this.refreshAllViews(!0)):this.updateViews(t)}observeItems(e=!1){if(!this.items){this.items=Ae;return}const t=this.itemsObserver,n=this.itemsObserver=w.getNotifier(this.items),s=t!==n;s&&t!==null&&t.unsubscribe(this),(s||e)&&n.subscribe(this)}updateViews(e){const t=this.childContext,n=this.views,s=this.bindView,o=this.items,r=this.template,a=this.options.recycle,l=[];let d=0,u=0;for(let c=0,f=e.length;c<f;++c){const b=e[c],y=b.removed;let T=0,I=b.index;const C=I+b.addedCount,_=n.splice(b.index,y.length),L=u=l.length+_.length;for(;I<C;++I){const se=n[I],oe=se?se.firstChild:this.location;let he;a&&u>0?(T<=L&&_.length>0?(he=_[T],T++):(he=l[d],d++),u--):he=r.create(),n.splice(I,0,he),s(he,o,I,t),he.insertBefore(oe)}_[T]&&l.push(..._.slice(T))}for(let c=d,f=l.length;c<f;++c)l[c].dispose();if(this.options.positioning)for(let c=0,f=n.length;c<f;++c){const b=n[c].context;b.length=f,b.index=c}}refreshAllViews(e=!1){const t=this.items,n=this.childContext,s=this.template,o=this.location,r=this.bindView;let a=t.length,l=this.views,d=l.length;if((a===0||e||!this.options.recycle)&&(Vs.disposeContiguousBatch(l),d=0),d===0){this.views=l=new Array(a);for(let u=0;u<a;++u){const c=s.create();r(c,t,u,n),l[u]=c,c.insertBefore(o)}}else{let u=0;for(;u<a;++u)if(u<d){const f=l[u];r(f,t,u,n)}else{const f=s.create();r(f,t,u,n),l.push(f),f.insertBefore(o)}const c=l.splice(u,d-u);for(u=0,a=c.length;u<a;++u)c[u].dispose()}}unbindAllViews(){const e=this.views;for(let t=0,n=e.length;t<n;++t)e[t].unbind()}}class Ys extends Kt{constructor(e,t,n){super(),this.itemsBinding=e,this.templateBinding=t,this.options=n,this.createPlaceholder=$.createBlockPlaceholder,Kr(),this.isItemsBindingVolatile=w.isVolatileBinding(e),this.isTemplateBindingVolatile=w.isVolatileBinding(t)}createBehavior(e){return new sa(e,this.itemsBinding,this.isItemsBindingVolatile,this.templateBinding,this.isTemplateBindingVolatile,this.options)}}function Zi(i){return i?function(e,t,n){return e.nodeType===1&&e.matches(i)}:function(e,t,n){return e.nodeType===1}}class Zs{constructor(e,t){this.target=e,this.options=t,this.source=null}bind(e){const t=this.options.property;this.shouldUpdate=w.getAccessors(e).some(n=>n.name===t),this.source=e,this.updateTarget(this.computeNodes()),this.shouldUpdate&&this.observe()}unbind(){this.updateTarget(Ae),this.source=null,this.shouldUpdate&&this.disconnect()}handleEvent(){this.updateTarget(this.computeNodes())}computeNodes(){let e=this.getNodes();return this.options.filter!==void 0&&(e=e.filter(this.options.filter)),e}updateTarget(e){this.source[this.options.property]=e}}class oa extends Zs{constructor(e,t){super(e,t)}observe(){this.target.addEventListener("slotchange",this)}disconnect(){this.target.removeEventListener("slotchange",this)}getNodes(){return this.target.assignedNodes(this.options)}}function ie(i){return typeof i=="string"&&(i={property:i}),new qi("fast-slotted",oa,i)}class ra extends Zs{constructor(e,t){super(e,t),this.observer=null,t.childList=!0}observe(){this.observer===null&&(this.observer=new MutationObserver(this.handleEvent.bind(this))),this.observer.observe(this.target,this.options)}disconnect(){this.observer.disconnect()}getNodes(){return"subtree"in this.options?Array.from(this.target.querySelectorAll(this.options.selector)):Array.from(this.target.childNodes)}}function Js(i){return typeof i=="string"&&(i={property:i}),new qi("fast-children",ra,i)}class Ye{handleStartContentChange(){this.startContainer.classList.toggle("start",this.start.assignedNodes().length>0)}handleEndContentChange(){this.endContainer.classList.toggle("end",this.end.assignedNodes().length>0)}}const Ze=(i,e)=>S`
    <span
        part="end"
        ${W("endContainer")}
        class=${t=>e.end?"end":void 0}
    >
        <slot name="end" ${W("end")} @slotchange="${t=>t.handleEndContentChange()}">
            ${e.end||""}
        </slot>
    </span>
`,Je=(i,e)=>S`
    <span
        part="start"
        ${W("startContainer")}
        class="${t=>e.start?"start":void 0}"
    >
        <slot
            name="start"
            ${W("start")}
            @slotchange="${t=>t.handleStartContentChange()}"
        >
            ${e.start||""}
        </slot>
    </span>
`;S`
    <span part="end" ${W("endContainer")}>
        <slot
            name="end"
            ${W("end")}
            @slotchange="${i=>i.handleEndContentChange()}"
        ></slot>
    </span>
`;S`
    <span part="start" ${W("startContainer")}>
        <slot
            name="start"
            ${W("start")}
            @slotchange="${i=>i.handleStartContentChange()}"
        ></slot>
    </span>
`;/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function h(i,e,t,n){var s=arguments.length,o=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(i,e,t,n);else for(var a=i.length-1;a>=0;a--)(r=i[a])&&(o=(s<3?r(o):s>3?r(e,t,o):r(e,t))||o);return s>3&&o&&Object.defineProperty(e,t,o),o}const bi=new Map;"metadata"in Reflect||(Reflect.metadata=function(i,e){return function(t){Reflect.defineMetadata(i,e,t)}},Reflect.defineMetadata=function(i,e,t){let n=bi.get(t);n===void 0&&bi.set(t,n=new Map),n.set(i,e)},Reflect.getOwnMetadata=function(i,e){const t=bi.get(e);if(t!==void 0)return t.get(i)});class aa{constructor(e,t){this.container=e,this.key=t}instance(e){return this.registerResolver(0,e)}singleton(e){return this.registerResolver(1,e)}transient(e){return this.registerResolver(2,e)}callback(e){return this.registerResolver(3,e)}cachedCallback(e){return this.registerResolver(3,eo(e))}aliasTo(e){return this.registerResolver(5,e)}registerResolver(e,t){const{container:n,key:s}=this;return this.container=this.key=void 0,n.registerResolver(s,new te(s,e,t))}}function nt(i){const e=i.slice(),t=Object.keys(i),n=t.length;let s;for(let o=0;o<n;++o)s=t[o],to(s)||(e[s]=i[s]);return e}const la=Object.freeze({none(i){throw Error(`${i.toString()} not registered, did you forget to add @singleton()?`)},singleton(i){return new te(i,1,i)},transient(i){return new te(i,2,i)}}),mi=Object.freeze({default:Object.freeze({parentLocator:()=>null,responsibleForOwnerRequests:!1,defaultResolver:la.singleton})}),Fn=new Map;function Ln(i){return e=>Reflect.getOwnMetadata(i,e)}let Hn=null;const A=Object.freeze({createContainer(i){return new ut(null,Object.assign({},mi.default,i))},findResponsibleContainer(i){const e=i.$$container$$;return e&&e.responsibleForOwnerRequests?e:A.findParentContainer(i)},findParentContainer(i){const e=new CustomEvent(Ks,{bubbles:!0,composed:!0,cancelable:!0,detail:{container:void 0}});return i.dispatchEvent(e),e.detail.container||A.getOrCreateDOMContainer()},getOrCreateDOMContainer(i,e){return i?i.$$container$$||new ut(i,Object.assign({},mi.default,e,{parentLocator:A.findParentContainer})):Hn||(Hn=new ut(null,Object.assign({},mi.default,e,{parentLocator:()=>null})))},getDesignParamtypes:Ln("design:paramtypes"),getAnnotationParamtypes:Ln("di:paramtypes"),getOrCreateAnnotationParamTypes(i){let e=this.getAnnotationParamtypes(i);return e===void 0&&Reflect.defineMetadata("di:paramtypes",e=[],i),e},getDependencies(i){let e=Fn.get(i);if(e===void 0){const t=i.inject;if(t===void 0){const n=A.getDesignParamtypes(i),s=A.getAnnotationParamtypes(i);if(n===void 0)if(s===void 0){const o=Object.getPrototypeOf(i);typeof o=="function"&&o!==Function.prototype?e=nt(A.getDependencies(o)):e=[]}else e=nt(s);else if(s===void 0)e=nt(n);else{e=nt(n);let o=s.length,r;for(let d=0;d<o;++d)r=s[d],r!==void 0&&(e[d]=r);const a=Object.keys(s);o=a.length;let l;for(let d=0;d<o;++d)l=a[d],to(l)||(e[l]=s[l])}}else e=nt(t);Fn.set(i,e)}return e},defineProperty(i,e,t,n=!1){const s=`$di_${e}`;Reflect.defineProperty(i,e,{get:function(){let o=this[s];if(o===void 0&&(o=(this instanceof HTMLElement?A.findResponsibleContainer(this):A.getOrCreateDOMContainer()).get(t),this[s]=o,n&&this instanceof ei)){const a=this.$fastController,l=()=>{const u=A.findResponsibleContainer(this).get(t),c=this[s];u!==c&&(this[s]=o,a.notify(e))};a.subscribe({handleChange:l},"isConnected")}return o}})},createInterface(i,e){const t=typeof i=="function"?i:e,n=typeof i=="string"?i:i&&"friendlyName"in i&&i.friendlyName||zn,s=typeof i=="string"?!1:i&&"respectConnection"in i&&i.respectConnection||!1,o=function(r,a,l){if(r==null||new.target!==void 0)throw new Error(`No registration for interface: '${o.friendlyName}'`);if(a)A.defineProperty(r,a,o,s);else{const d=A.getOrCreateAnnotationParamTypes(r);d[l]=o}};return o.$isInterface=!0,o.friendlyName=n??"(anonymous)",t!=null&&(o.register=function(r,a){return t(new aa(r,a??o))}),o.toString=function(){return`InterfaceSymbol<${o.friendlyName}>`},o},inject(...i){return function(e,t,n){if(typeof n=="number"){const s=A.getOrCreateAnnotationParamTypes(e),o=i[0];o!==void 0&&(s[n]=o)}else if(t)A.defineProperty(e,t,i[0]);else{const s=n?A.getOrCreateAnnotationParamTypes(n.value):A.getOrCreateAnnotationParamTypes(e);let o;for(let r=0;r<i.length;++r)o=i[r],o!==void 0&&(s[r]=o)}}},transient(i){return i.register=function(t){return vt.transient(i,i).register(t)},i.registerInRequestor=!1,i},singleton(i,e=da){return i.register=function(n){return vt.singleton(i,i).register(n)},i.registerInRequestor=e.scoped,i}}),ca=A.createInterface("Container");A.inject;const da={scoped:!1};class te{constructor(e,t,n){this.key=e,this.strategy=t,this.state=n,this.resolving=!1}get $isResolver(){return!0}register(e){return e.registerResolver(this.key,this)}resolve(e,t){switch(this.strategy){case 0:return this.state;case 1:{if(this.resolving)throw new Error(`Cyclic dependency found: ${this.state.name}`);return this.resolving=!0,this.state=e.getFactory(this.state).construct(t),this.strategy=0,this.resolving=!1,this.state}case 2:{const n=e.getFactory(this.state);if(n===null)throw new Error(`Resolver for ${String(this.key)} returned a null factory`);return n.construct(t)}case 3:return this.state(e,t,this);case 4:return this.state[0].resolve(e,t);case 5:return t.get(this.state);default:throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`)}}getFactory(e){var t,n,s;switch(this.strategy){case 1:case 2:return e.getFactory(this.state);case 5:return(s=(n=(t=e.getResolver(this.state))===null||t===void 0?void 0:t.getFactory)===null||n===void 0?void 0:n.call(t,e))!==null&&s!==void 0?s:null;default:return null}}}function Vn(i){return this.get(i)}function ha(i,e){return e(i)}class ua{constructor(e,t){this.Type=e,this.dependencies=t,this.transformers=null}construct(e,t){let n;return t===void 0?n=new this.Type(...this.dependencies.map(Vn,e)):n=new this.Type(...this.dependencies.map(Vn,e),...t),this.transformers==null?n:this.transformers.reduce(ha,n)}registerTransformer(e){(this.transformers||(this.transformers=[])).push(e)}}const pa={$isResolver:!0,resolve(i,e){return e}};function Mt(i){return typeof i.register=="function"}function fa(i){return Mt(i)&&typeof i.registerInRequestor=="boolean"}function Nn(i){return fa(i)&&i.registerInRequestor}function ba(i){return i.prototype!==void 0}const ma=new Set(["Array","ArrayBuffer","Boolean","DataView","Date","Error","EvalError","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Number","Object","Promise","RangeError","ReferenceError","RegExp","Set","SharedArrayBuffer","String","SyntaxError","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","URIError","WeakMap","WeakSet"]),Ks="__DI_LOCATE_PARENT__",gi=new Map;class ut{constructor(e,t){this.owner=e,this.config=t,this._parent=void 0,this.registerDepth=0,this.context=null,e!==null&&(e.$$container$$=this),this.resolvers=new Map,this.resolvers.set(ca,pa),e instanceof Node&&e.addEventListener(Ks,n=>{n.composedPath()[0]!==this.owner&&(n.detail.container=this,n.stopImmediatePropagation())})}get parent(){return this._parent===void 0&&(this._parent=this.config.parentLocator(this.owner)),this._parent}get depth(){return this.parent===null?0:this.parent.depth+1}get responsibleForOwnerRequests(){return this.config.responsibleForOwnerRequests}registerWithContext(e,...t){return this.context=e,this.register(...t),this.context=null,this}register(...e){if(++this.registerDepth===100)throw new Error("Unable to autoregister dependency");let t,n,s,o,r;const a=this.context;for(let l=0,d=e.length;l<d;++l)if(t=e[l],!!jn(t))if(Mt(t))t.register(this,a);else if(ba(t))vt.singleton(t,t).register(this);else for(n=Object.keys(t),o=0,r=n.length;o<r;++o)s=t[n[o]],jn(s)&&(Mt(s)?s.register(this,a):this.register(s));return--this.registerDepth,this}registerResolver(e,t){Et(e);const n=this.resolvers,s=n.get(e);return s==null?n.set(e,t):s instanceof te&&s.strategy===4?s.state.push(t):n.set(e,new te(e,4,[s,t])),t}registerTransformer(e,t){const n=this.getResolver(e);if(n==null)return!1;if(n.getFactory){const s=n.getFactory(this);return s==null?!1:(s.registerTransformer(t),!0)}return!1}getResolver(e,t=!0){if(Et(e),e.resolve!==void 0)return e;let n=this,s;for(;n!=null;)if(s=n.resolvers.get(e),s==null){if(n.parent==null){const o=Nn(e)?this:n;return t?this.jitRegister(e,o):null}n=n.parent}else return s;return null}has(e,t=!1){return this.resolvers.has(e)?!0:t&&this.parent!=null?this.parent.has(e,!0):!1}get(e){if(Et(e),e.$isResolver)return e.resolve(this,this);let t=this,n;for(;t!=null;)if(n=t.resolvers.get(e),n==null){if(t.parent==null){const s=Nn(e)?this:t;return n=this.jitRegister(e,s),n.resolve(t,this)}t=t.parent}else return n.resolve(t,this);throw new Error(`Unable to resolve key: ${String(e)}`)}getAll(e,t=!1){Et(e);const n=this;let s=n,o;if(t){let r=Ae;for(;s!=null;)o=s.resolvers.get(e),o!=null&&(r=r.concat(Mn(o,s,n))),s=s.parent;return r}else for(;s!=null;)if(o=s.resolvers.get(e),o==null){if(s=s.parent,s==null)return Ae}else return Mn(o,s,n);return Ae}getFactory(e){let t=gi.get(e);if(t===void 0){if(ga(e))throw new Error(`${e.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);gi.set(e,t=new ua(e,A.getDependencies(e)))}return t}registerFactory(e,t){gi.set(e,t)}createChild(e){return new ut(null,Object.assign({},this.config,e,{parentLocator:()=>this}))}jitRegister(e,t){if(typeof e!="function")throw new Error(`Attempted to jitRegister something that is not a constructor: '${e}'. Did you forget to register this dependency?`);if(ma.has(e.name))throw new Error(`Attempted to jitRegister an intrinsic type: ${e.name}. Did you forget to add @inject(Key)`);if(Mt(e)){const n=e.register(t);if(!(n instanceof Object)||n.resolve==null){const s=t.resolvers.get(e);if(s!=null)return s;throw new Error("A valid resolver was not returned from the static register method")}return n}else{if(e.$isInterface)throw new Error(`Attempted to jitRegister an interface: ${e.friendlyName}`);{const n=this.config.defaultResolver(e,t);return t.resolvers.set(e,n),n}}}}const vi=new WeakMap;function eo(i){return function(e,t,n){if(vi.has(n))return vi.get(n);const s=i(e,t,n);return vi.set(n,s),s}}const vt=Object.freeze({instance(i,e){return new te(i,0,e)},singleton(i,e){return new te(i,1,e)},transient(i,e){return new te(i,2,e)},callback(i,e){return new te(i,3,e)},cachedCallback(i,e){return new te(i,3,eo(e))},aliasTo(i,e){return new te(e,5,i)}});function Et(i){if(i==null)throw new Error("key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?")}function Mn(i,e,t){if(i instanceof te&&i.strategy===4){const n=i.state;let s=n.length;const o=new Array(s);for(;s--;)o[s]=n[s].resolve(e,t);return o}return[i.resolve(e,t)]}const zn="(anonymous)";function jn(i){return typeof i=="object"&&i!==null||typeof i=="function"}const ga=function(){const i=new WeakMap;let e=!1,t="",n=0;return function(s){return e=i.get(s),e===void 0&&(t=s.toString(),n=t.length,e=n>=29&&n<=100&&t.charCodeAt(n-1)===125&&t.charCodeAt(n-2)<=32&&t.charCodeAt(n-3)===93&&t.charCodeAt(n-4)===101&&t.charCodeAt(n-5)===100&&t.charCodeAt(n-6)===111&&t.charCodeAt(n-7)===99&&t.charCodeAt(n-8)===32&&t.charCodeAt(n-9)===101&&t.charCodeAt(n-10)===118&&t.charCodeAt(n-11)===105&&t.charCodeAt(n-12)===116&&t.charCodeAt(n-13)===97&&t.charCodeAt(n-14)===110&&t.charCodeAt(n-15)===88,i.set(s,e)),e}}(),At={};function to(i){switch(typeof i){case"number":return i>=0&&(i|0)===i;case"string":{const e=At[i];if(e!==void 0)return e;const t=i.length;if(t===0)return At[i]=!1;let n=0;for(let s=0;s<t;++s)if(n=i.charCodeAt(s),s===0&&n===48&&t>1||n<48||n>57)return At[i]=!1;return At[i]=!0}default:return!1}}function Un(i){return`${i.toLowerCase()}:presentation`}const Dt=new Map,io=Object.freeze({define(i,e,t){const n=Un(i);Dt.get(n)===void 0?Dt.set(n,e):Dt.set(n,!1),t.register(vt.instance(n,e))},forTag(i,e){const t=Un(i),n=Dt.get(t);return n===!1?A.findResponsibleContainer(e).get(t):n||null}});class va{constructor(e,t){this.template=e||null,this.styles=t===void 0?null:Array.isArray(t)?Y.create(t):t instanceof Y?t:Y.create([t])}applyTo(e){const t=e.$fastController;t.template===null&&(t.template=this.template),t.styles===null&&(t.styles=this.styles)}}class R extends ei{constructor(){super(...arguments),this._presentation=void 0}get $presentation(){return this._presentation===void 0&&(this._presentation=io.forTag(this.tagName,this)),this._presentation}templateChanged(){this.template!==void 0&&(this.$fastController.template=this.template)}stylesChanged(){this.styles!==void 0&&(this.$fastController.styles=this.styles)}connectedCallback(){this.$presentation!==null&&this.$presentation.applyTo(this),super.connectedCallback()}static compose(e){return(t={})=>new no(this===R?class extends R{}:this,e,t)}}h([g],R.prototype,"template",void 0);h([g],R.prototype,"styles",void 0);function st(i,e,t){return typeof i=="function"?i(e,t):i}class no{constructor(e,t,n){this.type=e,this.elementDefinition=t,this.overrideDefinition=n,this.definition=Object.assign(Object.assign({},this.elementDefinition),this.overrideDefinition)}register(e,t){const n=this.definition,s=this.overrideDefinition,r=`${n.prefix||t.elementPrefix}-${n.baseName}`;t.tryDefineElement({name:r,type:this.type,baseClass:this.elementDefinition.baseClass,callback:a=>{const l=new va(st(n.template,a,n),st(n.styles,a,n));a.definePresentation(l);let d=st(n.shadowOptions,a,n);a.shadowRootMode&&(d?s.shadowOptions||(d.mode=a.shadowRootMode):d!==null&&(d={mode:a.shadowRootMode})),a.defineElement({elementOptions:st(n.elementOptions,a,n),shadowOptions:d,attributes:st(n.attributes,a,n)})}})}}function J(i,...e){const t=Wt.locate(i);e.forEach(n=>{Object.getOwnPropertyNames(n.prototype).forEach(o=>{o!=="constructor"&&Object.defineProperty(i.prototype,o,Object.getOwnPropertyDescriptor(n.prototype,o))}),Wt.locate(n).forEach(o=>t.push(o))})}const Ji={horizontal:"horizontal",vertical:"vertical"};function ya(i,e){let t=i.length;for(;t--;)if(e(i[t],t,i))return t;return-1}function xa(){return!!(typeof window<"u"&&window.document&&window.document.createElement)}function _a(...i){return i.every(e=>e instanceof HTMLElement)}function wa(){const i=document.querySelector('meta[property="csp-nonce"]');return i?i.getAttribute("content"):null}let Se;function $a(){if(typeof Se=="boolean")return Se;if(!xa())return Se=!1,Se;const i=document.createElement("style"),e=wa();e!==null&&i.setAttribute("nonce",e),document.head.appendChild(i);try{i.sheet.insertRule("foo:focus-visible {color:inherit}",0),Se=!0}catch{Se=!1}finally{document.head.removeChild(i)}return Se}const qn="focus",Wn="focusin",We="focusout",Ge="keydown";var Gn;(function(i){i[i.alt=18]="alt",i[i.arrowDown=40]="arrowDown",i[i.arrowLeft=37]="arrowLeft",i[i.arrowRight=39]="arrowRight",i[i.arrowUp=38]="arrowUp",i[i.back=8]="back",i[i.backSlash=220]="backSlash",i[i.break=19]="break",i[i.capsLock=20]="capsLock",i[i.closeBracket=221]="closeBracket",i[i.colon=186]="colon",i[i.colon2=59]="colon2",i[i.comma=188]="comma",i[i.ctrl=17]="ctrl",i[i.delete=46]="delete",i[i.end=35]="end",i[i.enter=13]="enter",i[i.equals=187]="equals",i[i.equals2=61]="equals2",i[i.equals3=107]="equals3",i[i.escape=27]="escape",i[i.forwardSlash=191]="forwardSlash",i[i.function1=112]="function1",i[i.function10=121]="function10",i[i.function11=122]="function11",i[i.function12=123]="function12",i[i.function2=113]="function2",i[i.function3=114]="function3",i[i.function4=115]="function4",i[i.function5=116]="function5",i[i.function6=117]="function6",i[i.function7=118]="function7",i[i.function8=119]="function8",i[i.function9=120]="function9",i[i.home=36]="home",i[i.insert=45]="insert",i[i.menu=93]="menu",i[i.minus=189]="minus",i[i.minus2=109]="minus2",i[i.numLock=144]="numLock",i[i.numPad0=96]="numPad0",i[i.numPad1=97]="numPad1",i[i.numPad2=98]="numPad2",i[i.numPad3=99]="numPad3",i[i.numPad4=100]="numPad4",i[i.numPad5=101]="numPad5",i[i.numPad6=102]="numPad6",i[i.numPad7=103]="numPad7",i[i.numPad8=104]="numPad8",i[i.numPad9=105]="numPad9",i[i.numPadDivide=111]="numPadDivide",i[i.numPadDot=110]="numPadDot",i[i.numPadMinus=109]="numPadMinus",i[i.numPadMultiply=106]="numPadMultiply",i[i.numPadPlus=107]="numPadPlus",i[i.openBracket=219]="openBracket",i[i.pageDown=34]="pageDown",i[i.pageUp=33]="pageUp",i[i.period=190]="period",i[i.print=44]="print",i[i.quote=222]="quote",i[i.scrollLock=145]="scrollLock",i[i.shift=16]="shift",i[i.space=32]="space",i[i.tab=9]="tab",i[i.tilde=192]="tilde",i[i.windowsLeft=91]="windowsLeft",i[i.windowsOpera=219]="windowsOpera",i[i.windowsRight=92]="windowsRight"})(Gn||(Gn={}));const De="ArrowDown",yt="ArrowLeft",xt="ArrowRight",Pe="ArrowUp",$t="Enter",ti="Escape",Ke="Home",et="End",Ca="F2",ka="PageDown",Ta="PageUp",Ct=" ",Ki="Tab",Ia={ArrowDown:De,ArrowLeft:yt,ArrowRight:xt,ArrowUp:Pe};var Qe;(function(i){i.ltr="ltr",i.rtl="rtl"})(Qe||(Qe={}));function Sa(i,e,t){return Math.min(Math.max(t,i),e)}function Pt(i,e,t=0){return[e,t]=[e,t].sort((n,s)=>n-s),e<=i&&i<t}let Oa=0;function Qt(i=""){return`${i}${Oa++}`}const Ra=(i,e)=>S`
    <a
        class="control"
        part="control"
        download="${t=>t.download}"
        href="${t=>t.href}"
        hreflang="${t=>t.hreflang}"
        ping="${t=>t.ping}"
        referrerpolicy="${t=>t.referrerpolicy}"
        rel="${t=>t.rel}"
        target="${t=>t.target}"
        type="${t=>t.type}"
        aria-atomic="${t=>t.ariaAtomic}"
        aria-busy="${t=>t.ariaBusy}"
        aria-controls="${t=>t.ariaControls}"
        aria-current="${t=>t.ariaCurrent}"
        aria-describedby="${t=>t.ariaDescribedby}"
        aria-details="${t=>t.ariaDetails}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-errormessage="${t=>t.ariaErrormessage}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-flowto="${t=>t.ariaFlowto}"
        aria-haspopup="${t=>t.ariaHaspopup}"
        aria-hidden="${t=>t.ariaHidden}"
        aria-invalid="${t=>t.ariaInvalid}"
        aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
        aria-label="${t=>t.ariaLabel}"
        aria-labelledby="${t=>t.ariaLabelledby}"
        aria-live="${t=>t.ariaLive}"
        aria-owns="${t=>t.ariaOwns}"
        aria-relevant="${t=>t.ariaRelevant}"
        aria-roledescription="${t=>t.ariaRoledescription}"
        ${W("control")}
    >
        ${Je(i,e)}
        <span class="content" part="content">
            <slot ${ie("defaultSlottedContent")}></slot>
        </span>
        ${Ze(i,e)}
    </a>
`;class E{}h([p({attribute:"aria-atomic"})],E.prototype,"ariaAtomic",void 0);h([p({attribute:"aria-busy"})],E.prototype,"ariaBusy",void 0);h([p({attribute:"aria-controls"})],E.prototype,"ariaControls",void 0);h([p({attribute:"aria-current"})],E.prototype,"ariaCurrent",void 0);h([p({attribute:"aria-describedby"})],E.prototype,"ariaDescribedby",void 0);h([p({attribute:"aria-details"})],E.prototype,"ariaDetails",void 0);h([p({attribute:"aria-disabled"})],E.prototype,"ariaDisabled",void 0);h([p({attribute:"aria-errormessage"})],E.prototype,"ariaErrormessage",void 0);h([p({attribute:"aria-flowto"})],E.prototype,"ariaFlowto",void 0);h([p({attribute:"aria-haspopup"})],E.prototype,"ariaHaspopup",void 0);h([p({attribute:"aria-hidden"})],E.prototype,"ariaHidden",void 0);h([p({attribute:"aria-invalid"})],E.prototype,"ariaInvalid",void 0);h([p({attribute:"aria-keyshortcuts"})],E.prototype,"ariaKeyshortcuts",void 0);h([p({attribute:"aria-label"})],E.prototype,"ariaLabel",void 0);h([p({attribute:"aria-labelledby"})],E.prototype,"ariaLabelledby",void 0);h([p({attribute:"aria-live"})],E.prototype,"ariaLive",void 0);h([p({attribute:"aria-owns"})],E.prototype,"ariaOwns",void 0);h([p({attribute:"aria-relevant"})],E.prototype,"ariaRelevant",void 0);h([p({attribute:"aria-roledescription"})],E.prototype,"ariaRoledescription",void 0);class le extends R{constructor(){super(...arguments),this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{var t;(t=this.control)===null||t===void 0||t.focus()})}}connectedCallback(){super.connectedCallback(),this.handleUnsupportedDelegatesFocus()}}h([p],le.prototype,"download",void 0);h([p],le.prototype,"href",void 0);h([p],le.prototype,"hreflang",void 0);h([p],le.prototype,"ping",void 0);h([p],le.prototype,"referrerpolicy",void 0);h([p],le.prototype,"rel",void 0);h([p],le.prototype,"target",void 0);h([p],le.prototype,"type",void 0);h([g],le.prototype,"defaultSlottedContent",void 0);class en{}h([p({attribute:"aria-expanded"})],en.prototype,"ariaExpanded",void 0);J(en,E);J(le,Ye,en);const Ea=i=>{const e=i.closest("[dir]");return e!==null&&e.dir==="rtl"?Qe.rtl:Qe.ltr},so=(i,e)=>S`
    <template class="${t=>t.circular?"circular":""}">
        <div class="control" part="control" style="${t=>t.generateBadgeStyle()}">
            <slot></slot>
        </div>
    </template>
`;let kt=class extends R{constructor(){super(...arguments),this.generateBadgeStyle=()=>{if(!this.fill&&!this.color)return;const e=`background-color: var(--badge-fill-${this.fill});`,t=`color: var(--badge-color-${this.color});`;return this.fill&&!this.color?e:this.color&&!this.fill?t:`${t} ${e}`}}};h([p({attribute:"fill"})],kt.prototype,"fill",void 0);h([p({attribute:"color"})],kt.prototype,"color",void 0);h([p({mode:"boolean"})],kt.prototype,"circular",void 0);const Aa=(i,e)=>S`
    <button
        class="control"
        part="control"
        ?autofocus="${t=>t.autofocus}"
        ?disabled="${t=>t.disabled}"
        form="${t=>t.formId}"
        formaction="${t=>t.formaction}"
        formenctype="${t=>t.formenctype}"
        formmethod="${t=>t.formmethod}"
        formnovalidate="${t=>t.formnovalidate}"
        formtarget="${t=>t.formtarget}"
        name="${t=>t.name}"
        type="${t=>t.type}"
        value="${t=>t.value}"
        aria-atomic="${t=>t.ariaAtomic}"
        aria-busy="${t=>t.ariaBusy}"
        aria-controls="${t=>t.ariaControls}"
        aria-current="${t=>t.ariaCurrent}"
        aria-describedby="${t=>t.ariaDescribedby}"
        aria-details="${t=>t.ariaDetails}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-errormessage="${t=>t.ariaErrormessage}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-flowto="${t=>t.ariaFlowto}"
        aria-haspopup="${t=>t.ariaHaspopup}"
        aria-hidden="${t=>t.ariaHidden}"
        aria-invalid="${t=>t.ariaInvalid}"
        aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
        aria-label="${t=>t.ariaLabel}"
        aria-labelledby="${t=>t.ariaLabelledby}"
        aria-live="${t=>t.ariaLive}"
        aria-owns="${t=>t.ariaOwns}"
        aria-pressed="${t=>t.ariaPressed}"
        aria-relevant="${t=>t.ariaRelevant}"
        aria-roledescription="${t=>t.ariaRoledescription}"
        ${W("control")}
    >
        ${Je(i,e)}
        <span class="content" part="content">
            <slot ${ie("defaultSlottedContent")}></slot>
        </span>
        ${Ze(i,e)}
    </button>
`,Qn="form-associated-proxy",Xn="ElementInternals",Yn=Xn in window&&"setFormValue"in window[Xn].prototype,Zn=new WeakMap;function Tt(i){const e=class extends i{constructor(...t){super(...t),this.dirtyValue=!1,this.disabled=!1,this.proxyEventsToBlock=["change","click"],this.proxyInitialized=!1,this.required=!1,this.initialValue=this.initialValue||"",this.elementInternals||(this.formResetCallback=this.formResetCallback.bind(this))}static get formAssociated(){return Yn}get validity(){return this.elementInternals?this.elementInternals.validity:this.proxy.validity}get form(){return this.elementInternals?this.elementInternals.form:this.proxy.form}get validationMessage(){return this.elementInternals?this.elementInternals.validationMessage:this.proxy.validationMessage}get willValidate(){return this.elementInternals?this.elementInternals.willValidate:this.proxy.willValidate}get labels(){if(this.elementInternals)return Object.freeze(Array.from(this.elementInternals.labels));if(this.proxy instanceof HTMLElement&&this.proxy.ownerDocument&&this.id){const t=this.proxy.labels,n=Array.from(this.proxy.getRootNode().querySelectorAll(`[for='${this.id}']`)),s=t?n.concat(Array.from(t)):n;return Object.freeze(s)}else return Ae}valueChanged(t,n){this.dirtyValue=!0,this.proxy instanceof HTMLElement&&(this.proxy.value=this.value),this.currentValue=this.value,this.setFormValue(this.value),this.validate()}currentValueChanged(){this.value=this.currentValue}initialValueChanged(t,n){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}disabledChanged(t,n){this.proxy instanceof HTMLElement&&(this.proxy.disabled=this.disabled),$.queueUpdate(()=>this.classList.toggle("disabled",this.disabled))}nameChanged(t,n){this.proxy instanceof HTMLElement&&(this.proxy.name=this.name)}requiredChanged(t,n){this.proxy instanceof HTMLElement&&(this.proxy.required=this.required),$.queueUpdate(()=>this.classList.toggle("required",this.required)),this.validate()}get elementInternals(){if(!Yn)return null;let t=Zn.get(this);return t||(t=this.attachInternals(),Zn.set(this,t)),t}connectedCallback(){super.connectedCallback(),this.addEventListener("keypress",this._keypressHandler),this.value||(this.value=this.initialValue,this.dirtyValue=!1),this.elementInternals||(this.attachProxy(),this.form&&this.form.addEventListener("reset",this.formResetCallback))}disconnectedCallback(){super.disconnectedCallback(),this.proxyEventsToBlock.forEach(t=>this.proxy.removeEventListener(t,this.stopPropagation)),!this.elementInternals&&this.form&&this.form.removeEventListener("reset",this.formResetCallback)}checkValidity(){return this.elementInternals?this.elementInternals.checkValidity():this.proxy.checkValidity()}reportValidity(){return this.elementInternals?this.elementInternals.reportValidity():this.proxy.reportValidity()}setValidity(t,n,s){this.elementInternals?this.elementInternals.setValidity(t,n,s):typeof n=="string"&&this.proxy.setCustomValidity(n)}formDisabledCallback(t){this.disabled=t}formResetCallback(){this.value=this.initialValue,this.dirtyValue=!1}attachProxy(){var t;this.proxyInitialized||(this.proxyInitialized=!0,this.proxy.style.display="none",this.proxyEventsToBlock.forEach(n=>this.proxy.addEventListener(n,this.stopPropagation)),this.proxy.disabled=this.disabled,this.proxy.required=this.required,typeof this.name=="string"&&(this.proxy.name=this.name),typeof this.value=="string"&&(this.proxy.value=this.value),this.proxy.setAttribute("slot",Qn),this.proxySlot=document.createElement("slot"),this.proxySlot.setAttribute("name",Qn)),(t=this.shadowRoot)===null||t===void 0||t.appendChild(this.proxySlot),this.appendChild(this.proxy)}detachProxy(){var t;this.removeChild(this.proxy),(t=this.shadowRoot)===null||t===void 0||t.removeChild(this.proxySlot)}validate(t){this.proxy instanceof HTMLElement&&this.setValidity(this.proxy.validity,this.proxy.validationMessage,t)}setFormValue(t,n){this.elementInternals&&this.elementInternals.setFormValue(t,n||t)}_keypressHandler(t){switch(t.key){case $t:if(this.form instanceof HTMLFormElement){const n=this.form.querySelector("[type=submit]");n==null||n.click()}break}}stopPropagation(t){t.stopPropagation()}};return p({mode:"boolean"})(e.prototype,"disabled"),p({mode:"fromView",attribute:"value"})(e.prototype,"initialValue"),p({attribute:"current-value"})(e.prototype,"currentValue"),p(e.prototype,"name"),p({mode:"boolean"})(e.prototype,"required"),g(e.prototype,"value"),e}function oo(i){class e extends Tt(i){}class t extends e{constructor(...s){super(s),this.dirtyChecked=!1,this.checkedAttribute=!1,this.checked=!1,this.dirtyChecked=!1}checkedAttributeChanged(){this.defaultChecked=this.checkedAttribute}defaultCheckedChanged(){this.dirtyChecked||(this.checked=this.defaultChecked,this.dirtyChecked=!1)}checkedChanged(s,o){this.dirtyChecked||(this.dirtyChecked=!0),this.currentChecked=this.checked,this.updateForm(),this.proxy instanceof HTMLInputElement&&(this.proxy.checked=this.checked),s!==void 0&&this.$emit("change"),this.validate()}currentCheckedChanged(s,o){this.checked=this.currentChecked}updateForm(){const s=this.checked?this.value:null;this.setFormValue(s,s)}connectedCallback(){super.connectedCallback(),this.updateForm()}formResetCallback(){super.formResetCallback(),this.checked=!!this.checkedAttribute,this.dirtyChecked=!1}}return p({attribute:"checked",mode:"boolean"})(t.prototype,"checkedAttribute"),p({attribute:"current-checked",converter:js})(t.prototype,"currentChecked"),g(t.prototype,"defaultChecked"),g(t.prototype,"checked"),t}class Da extends R{}class Pa extends Tt(Da){constructor(){super(...arguments),this.proxy=document.createElement("input")}}let ce=class extends Pa{constructor(){super(...arguments),this.handleClick=e=>{var t;this.disabled&&((t=this.defaultSlottedContent)===null||t===void 0?void 0:t.length)<=1&&e.stopPropagation()},this.handleSubmission=()=>{if(!this.form)return;const e=this.proxy.isConnected;e||this.attachProxy(),typeof this.form.requestSubmit=="function"?this.form.requestSubmit(this.proxy):this.proxy.click(),e||this.detachProxy()},this.handleFormReset=()=>{var e;(e=this.form)===null||e===void 0||e.reset()},this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{this.control.focus()})}}formactionChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formAction=this.formaction)}formenctypeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formEnctype=this.formenctype)}formmethodChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formMethod=this.formmethod)}formnovalidateChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formNoValidate=this.formnovalidate)}formtargetChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formTarget=this.formtarget)}typeChanged(e,t){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type),t==="submit"&&this.addEventListener("click",this.handleSubmission),e==="submit"&&this.removeEventListener("click",this.handleSubmission),t==="reset"&&this.addEventListener("click",this.handleFormReset),e==="reset"&&this.removeEventListener("click",this.handleFormReset)}validate(){super.validate(this.control)}connectedCallback(){var e;super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.handleUnsupportedDelegatesFocus();const t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(n=>{n.addEventListener("click",this.handleClick)})}disconnectedCallback(){var e;super.disconnectedCallback();const t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(n=>{n.removeEventListener("click",this.handleClick)})}};h([p({mode:"boolean"})],ce.prototype,"autofocus",void 0);h([p({attribute:"form"})],ce.prototype,"formId",void 0);h([p],ce.prototype,"formaction",void 0);h([p],ce.prototype,"formenctype",void 0);h([p],ce.prototype,"formmethod",void 0);h([p({mode:"boolean"})],ce.prototype,"formnovalidate",void 0);h([p],ce.prototype,"formtarget",void 0);h([p],ce.prototype,"type",void 0);h([g],ce.prototype,"defaultSlottedContent",void 0);class ii{}h([p({attribute:"aria-expanded"})],ii.prototype,"ariaExpanded",void 0);h([p({attribute:"aria-pressed"})],ii.prototype,"ariaPressed",void 0);J(ii,E);J(ce,Ye,ii);const Bt={none:"none",default:"default",sticky:"sticky"},xe={default:"default",columnHeader:"columnheader",rowHeader:"rowheader"},pt={default:"default",header:"header",stickyHeader:"sticky-header"};let M=class extends R{constructor(){super(...arguments),this.rowType=pt.default,this.rowData=null,this.columnDefinitions=null,this.isActiveRow=!1,this.cellsRepeatBehavior=null,this.cellsPlaceholder=null,this.focusColumnIndex=0,this.refocusOnLoad=!1,this.updateRowStyle=()=>{this.style.gridTemplateColumns=this.gridTemplateColumns}}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowStyle()}rowTypeChanged(){this.$fastController.isConnected&&this.updateItemTemplate()}rowDataChanged(){if(this.rowData!==null&&this.isActiveRow){this.refocusOnLoad=!0;return}}cellItemTemplateChanged(){this.updateItemTemplate()}headerCellItemTemplateChanged(){this.updateItemTemplate()}connectedCallback(){super.connectedCallback(),this.cellsRepeatBehavior===null&&(this.cellsPlaceholder=document.createComment(""),this.appendChild(this.cellsPlaceholder),this.updateItemTemplate(),this.cellsRepeatBehavior=new Ys(e=>e.columnDefinitions,e=>e.activeCellItemTemplate,{positioning:!0}).createBehavior(this.cellsPlaceholder),this.$fastController.addBehaviors([this.cellsRepeatBehavior])),this.addEventListener("cell-focused",this.handleCellFocus),this.addEventListener(We,this.handleFocusout),this.addEventListener(Ge,this.handleKeydown),this.updateRowStyle(),this.refocusOnLoad&&(this.refocusOnLoad=!1,this.cellElements.length>this.focusColumnIndex&&this.cellElements[this.focusColumnIndex].focus())}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("cell-focused",this.handleCellFocus),this.removeEventListener(We,this.handleFocusout),this.removeEventListener(Ge,this.handleKeydown)}handleFocusout(e){this.contains(e.target)||(this.isActiveRow=!1,this.focusColumnIndex=0)}handleCellFocus(e){this.isActiveRow=!0,this.focusColumnIndex=this.cellElements.indexOf(e.target),this.$emit("row-focused",this)}handleKeydown(e){if(e.defaultPrevented)return;let t=0;switch(e.key){case yt:t=Math.max(0,this.focusColumnIndex-1),this.cellElements[t].focus(),e.preventDefault();break;case xt:t=Math.min(this.cellElements.length-1,this.focusColumnIndex+1),this.cellElements[t].focus(),e.preventDefault();break;case Ke:e.ctrlKey||(this.cellElements[0].focus(),e.preventDefault());break;case et:e.ctrlKey||(this.cellElements[this.cellElements.length-1].focus(),e.preventDefault());break}}updateItemTemplate(){this.activeCellItemTemplate=this.rowType===pt.default&&this.cellItemTemplate!==void 0?this.cellItemTemplate:this.rowType===pt.default&&this.cellItemTemplate===void 0?this.defaultCellItemTemplate:this.headerCellItemTemplate!==void 0?this.headerCellItemTemplate:this.defaultHeaderCellItemTemplate}};h([p({attribute:"grid-template-columns"})],M.prototype,"gridTemplateColumns",void 0);h([p({attribute:"row-type"})],M.prototype,"rowType",void 0);h([g],M.prototype,"rowData",void 0);h([g],M.prototype,"columnDefinitions",void 0);h([g],M.prototype,"cellItemTemplate",void 0);h([g],M.prototype,"headerCellItemTemplate",void 0);h([g],M.prototype,"rowIndex",void 0);h([g],M.prototype,"isActiveRow",void 0);h([g],M.prototype,"activeCellItemTemplate",void 0);h([g],M.prototype,"defaultCellItemTemplate",void 0);h([g],M.prototype,"defaultHeaderCellItemTemplate",void 0);h([g],M.prototype,"cellElements",void 0);function Ba(i){const e=i.tagFor(M);return S`
    <${e}
        :rowData="${t=>t}"
        :cellItemTemplate="${(t,n)=>n.parent.cellItemTemplate}"
        :headerCellItemTemplate="${(t,n)=>n.parent.headerCellItemTemplate}"
    ></${e}>
`}const Fa=(i,e)=>{const t=Ba(i),n=i.tagFor(M);return S`
        <template
            role="grid"
            tabindex="0"
            :rowElementTag="${()=>n}"
            :defaultRowItemTemplate="${t}"
            ${Js({property:"rowElements",filter:Zi("[role=row]")})}
        >
            <slot></slot>
        </template>
    `};let z=class Di extends R{constructor(){super(),this.noTabbing=!1,this.generateHeader=Bt.default,this.rowsData=[],this.columnDefinitions=null,this.focusRowIndex=0,this.focusColumnIndex=0,this.rowsPlaceholder=null,this.generatedHeader=null,this.isUpdatingFocus=!1,this.pendingFocusUpdate=!1,this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!0,this.generatedGridTemplateColumns="",this.focusOnCell=(e,t,n)=>{if(this.rowElements.length===0){this.focusRowIndex=0,this.focusColumnIndex=0;return}const s=Math.max(0,Math.min(this.rowElements.length-1,e)),r=this.rowElements[s].querySelectorAll('[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'),a=Math.max(0,Math.min(r.length-1,t)),l=r[a];n&&this.scrollHeight!==this.clientHeight&&(s<this.focusRowIndex&&this.scrollTop>0||s>this.focusRowIndex&&this.scrollTop<this.scrollHeight-this.clientHeight)&&l.scrollIntoView({block:"center",inline:"center"}),l.focus()},this.onChildListChange=(e,t)=>{e&&e.length&&(e.forEach(n=>{n.addedNodes.forEach(s=>{s.nodeType===1&&s.getAttribute("role")==="row"&&(s.columnDefinitions=this.columnDefinitions)})}),this.queueRowIndexUpdate())},this.queueRowIndexUpdate=()=>{this.rowindexUpdateQueued||(this.rowindexUpdateQueued=!0,$.queueUpdate(this.updateRowIndexes))},this.updateRowIndexes=()=>{let e=this.gridTemplateColumns;if(e===void 0){if(this.generatedGridTemplateColumns===""&&this.rowElements.length>0){const t=this.rowElements[0];this.generatedGridTemplateColumns=new Array(t.cellElements.length).fill("1fr").join(" ")}e=this.generatedGridTemplateColumns}this.rowElements.forEach((t,n)=>{const s=t;s.rowIndex=n,s.gridTemplateColumns=e,this.columnDefinitionsStale&&(s.columnDefinitions=this.columnDefinitions)}),this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!1}}static generateTemplateColumns(e){let t="";return e.forEach(n=>{t=`${t}${t===""?"":" "}1fr`}),t}noTabbingChanged(){this.$fastController.isConnected&&(this.noTabbing?this.setAttribute("tabIndex","-1"):this.setAttribute("tabIndex",this.contains(document.activeElement)||this===document.activeElement?"-1":"0"))}generateHeaderChanged(){this.$fastController.isConnected&&this.toggleGeneratedHeader()}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowIndexes()}rowsDataChanged(){this.columnDefinitions===null&&this.rowsData.length>0&&(this.columnDefinitions=Di.generateColumns(this.rowsData[0])),this.$fastController.isConnected&&this.toggleGeneratedHeader()}columnDefinitionsChanged(){if(this.columnDefinitions===null){this.generatedGridTemplateColumns="";return}this.generatedGridTemplateColumns=Di.generateTemplateColumns(this.columnDefinitions),this.$fastController.isConnected&&(this.columnDefinitionsStale=!0,this.queueRowIndexUpdate())}headerCellItemTemplateChanged(){this.$fastController.isConnected&&this.generatedHeader!==null&&(this.generatedHeader.headerCellItemTemplate=this.headerCellItemTemplate)}focusRowIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}focusColumnIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}connectedCallback(){super.connectedCallback(),this.rowItemTemplate===void 0&&(this.rowItemTemplate=this.defaultRowItemTemplate),this.rowsPlaceholder=document.createComment(""),this.appendChild(this.rowsPlaceholder),this.toggleGeneratedHeader(),this.rowsRepeatBehavior=new Ys(e=>e.rowsData,e=>e.rowItemTemplate,{positioning:!0}).createBehavior(this.rowsPlaceholder),this.$fastController.addBehaviors([this.rowsRepeatBehavior]),this.addEventListener("row-focused",this.handleRowFocus),this.addEventListener(qn,this.handleFocus),this.addEventListener(Ge,this.handleKeydown),this.addEventListener(We,this.handleFocusOut),this.observer=new MutationObserver(this.onChildListChange),this.observer.observe(this,{childList:!0}),this.noTabbing&&this.setAttribute("tabindex","-1"),$.queueUpdate(this.queueRowIndexUpdate)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("row-focused",this.handleRowFocus),this.removeEventListener(qn,this.handleFocus),this.removeEventListener(Ge,this.handleKeydown),this.removeEventListener(We,this.handleFocusOut),this.observer.disconnect(),this.rowsPlaceholder=null,this.generatedHeader=null}handleRowFocus(e){this.isUpdatingFocus=!0;const t=e.target;this.focusRowIndex=this.rowElements.indexOf(t),this.focusColumnIndex=t.focusColumnIndex,this.setAttribute("tabIndex","-1"),this.isUpdatingFocus=!1}handleFocus(e){this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}handleFocusOut(e){(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabIndex",this.noTabbing?"-1":"0")}handleKeydown(e){if(e.defaultPrevented)return;let t;const n=this.rowElements.length-1,s=this.offsetHeight+this.scrollTop,o=this.rowElements[n];switch(e.key){case Pe:e.preventDefault(),this.focusOnCell(this.focusRowIndex-1,this.focusColumnIndex,!0);break;case De:e.preventDefault(),this.focusOnCell(this.focusRowIndex+1,this.focusColumnIndex,!0);break;case Ta:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex===0){this.focusOnCell(0,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex-1,t;t>=0;t--){const r=this.rowElements[t];if(r.offsetTop<this.scrollTop){this.scrollTop=r.offsetTop+r.clientHeight-this.clientHeight;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case ka:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex>=n||o.offsetTop+o.offsetHeight<=s){this.focusOnCell(n,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex+1,t;t<=n;t++){const r=this.rowElements[t];if(r.offsetTop+r.offsetHeight>s){let a=0;this.generateHeader===Bt.sticky&&this.generatedHeader!==null&&(a=this.generatedHeader.clientHeight),this.scrollTop=r.offsetTop-a;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case Ke:e.ctrlKey&&(e.preventDefault(),this.focusOnCell(0,0,!0));break;case et:e.ctrlKey&&this.columnDefinitions!==null&&(e.preventDefault(),this.focusOnCell(this.rowElements.length-1,this.columnDefinitions.length-1,!0));break}}queueFocusUpdate(){this.isUpdatingFocus&&(this.contains(document.activeElement)||this===document.activeElement)||this.pendingFocusUpdate===!1&&(this.pendingFocusUpdate=!0,$.queueUpdate(()=>this.updateFocus()))}updateFocus(){this.pendingFocusUpdate=!1,this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}toggleGeneratedHeader(){if(this.generatedHeader!==null&&(this.removeChild(this.generatedHeader),this.generatedHeader=null),this.generateHeader!==Bt.none&&this.rowsData.length>0){const e=document.createElement(this.rowElementTag);this.generatedHeader=e,this.generatedHeader.columnDefinitions=this.columnDefinitions,this.generatedHeader.gridTemplateColumns=this.gridTemplateColumns,this.generatedHeader.rowType=this.generateHeader===Bt.sticky?pt.stickyHeader:pt.header,(this.firstChild!==null||this.rowsPlaceholder!==null)&&this.insertBefore(e,this.firstChild!==null?this.firstChild:this.rowsPlaceholder);return}}};z.generateColumns=i=>Object.getOwnPropertyNames(i).map((e,t)=>({columnDataKey:e,gridColumn:`${t}`}));h([p({attribute:"no-tabbing",mode:"boolean"})],z.prototype,"noTabbing",void 0);h([p({attribute:"generate-header"})],z.prototype,"generateHeader",void 0);h([p({attribute:"grid-template-columns"})],z.prototype,"gridTemplateColumns",void 0);h([g],z.prototype,"rowsData",void 0);h([g],z.prototype,"columnDefinitions",void 0);h([g],z.prototype,"rowItemTemplate",void 0);h([g],z.prototype,"cellItemTemplate",void 0);h([g],z.prototype,"headerCellItemTemplate",void 0);h([g],z.prototype,"focusRowIndex",void 0);h([g],z.prototype,"focusColumnIndex",void 0);h([g],z.prototype,"defaultRowItemTemplate",void 0);h([g],z.prototype,"rowElementTag",void 0);h([g],z.prototype,"rowElements",void 0);const La=S`
    <template>
        ${i=>i.rowData===null||i.columnDefinition===null||i.columnDefinition.columnDataKey===null?null:i.rowData[i.columnDefinition.columnDataKey]}
    </template>
`,Ha=S`
    <template>
        ${i=>i.columnDefinition===null?null:i.columnDefinition.title===void 0?i.columnDefinition.columnDataKey:i.columnDefinition.title}
    </template>
`;let ke=class extends R{constructor(){super(...arguments),this.cellType=xe.default,this.rowData=null,this.columnDefinition=null,this.isActiveCell=!1,this.customCellView=null,this.updateCellStyle=()=>{this.style.gridColumn=this.gridColumn}}cellTypeChanged(){this.$fastController.isConnected&&this.updateCellView()}gridColumnChanged(){this.$fastController.isConnected&&this.updateCellStyle()}columnDefinitionChanged(e,t){this.$fastController.isConnected&&this.updateCellView()}connectedCallback(){var e;super.connectedCallback(),this.addEventListener(Wn,this.handleFocusin),this.addEventListener(We,this.handleFocusout),this.addEventListener(Ge,this.handleKeydown),this.style.gridColumn=`${((e=this.columnDefinition)===null||e===void 0?void 0:e.gridColumn)===void 0?0:this.columnDefinition.gridColumn}`,this.updateCellView(),this.updateCellStyle()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Wn,this.handleFocusin),this.removeEventListener(We,this.handleFocusout),this.removeEventListener(Ge,this.handleKeydown),this.disconnectCellView()}handleFocusin(e){if(!this.isActiveCell){switch(this.isActiveCell=!0,this.cellType){case xe.columnHeader:if(this.columnDefinition!==null&&this.columnDefinition.headerCellInternalFocusQueue!==!0&&typeof this.columnDefinition.headerCellFocusTargetCallback=="function"){const t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus()}break;default:if(this.columnDefinition!==null&&this.columnDefinition.cellInternalFocusQueue!==!0&&typeof this.columnDefinition.cellFocusTargetCallback=="function"){const t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus()}break}this.$emit("cell-focused",this)}}handleFocusout(e){this!==document.activeElement&&!this.contains(document.activeElement)&&(this.isActiveCell=!1)}handleKeydown(e){if(!(e.defaultPrevented||this.columnDefinition===null||this.cellType===xe.default&&this.columnDefinition.cellInternalFocusQueue!==!0||this.cellType===xe.columnHeader&&this.columnDefinition.headerCellInternalFocusQueue!==!0))switch(e.key){case $t:case Ca:if(this.contains(document.activeElement)&&document.activeElement!==this)return;switch(this.cellType){case xe.columnHeader:if(this.columnDefinition.headerCellFocusTargetCallback!==void 0){const t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break;default:if(this.columnDefinition.cellFocusTargetCallback!==void 0){const t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break}break;case ti:this.contains(document.activeElement)&&document.activeElement!==this&&(this.focus(),e.preventDefault());break}}updateCellView(){if(this.disconnectCellView(),this.columnDefinition!==null)switch(this.cellType){case xe.columnHeader:this.columnDefinition.headerCellTemplate!==void 0?this.customCellView=this.columnDefinition.headerCellTemplate.render(this,this):this.customCellView=Ha.render(this,this);break;case void 0:case xe.rowHeader:case xe.default:this.columnDefinition.cellTemplate!==void 0?this.customCellView=this.columnDefinition.cellTemplate.render(this,this):this.customCellView=La.render(this,this);break}}disconnectCellView(){this.customCellView!==null&&(this.customCellView.dispose(),this.customCellView=null)}};h([p({attribute:"cell-type"})],ke.prototype,"cellType",void 0);h([p({attribute:"grid-column"})],ke.prototype,"gridColumn",void 0);h([g],ke.prototype,"rowData",void 0);h([g],ke.prototype,"columnDefinition",void 0);function Va(i){const e=i.tagFor(ke);return S`
    <${e}
        cell-type="${t=>t.isRowHeader?"rowheader":void 0}"
        grid-column="${(t,n)=>n.index+1}"
        :rowData="${(t,n)=>n.parent.rowData}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}function Na(i){const e=i.tagFor(ke);return S`
    <${e}
        cell-type="columnheader"
        grid-column="${(t,n)=>n.index+1}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}const Ma=(i,e)=>{const t=Va(i),n=Na(i);return S`
        <template
            role="row"
            class="${s=>s.rowType!=="default"?s.rowType:""}"
            :defaultCellItemTemplate="${t}"
            :defaultHeaderCellItemTemplate="${n}"
            ${Js({property:"cellElements",filter:Zi('[role="cell"],[role="gridcell"],[role="columnheader"],[role="rowheader"]')})}
        >
            <slot ${ie("slottedCellElements")}></slot>
        </template>
    `},za=(i,e)=>S`
        <template
            tabindex="-1"
            role="${t=>!t.cellType||t.cellType==="default"?"gridcell":t.cellType}"
            class="
            ${t=>t.cellType==="columnheader"?"column-header":t.cellType==="rowheader"?"row-header":""}
            "
        >
            <slot></slot>
        </template>
    `,ja=(i,e)=>S`
    <template
        role="checkbox"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        tabindex="${t=>t.disabled?null:0}"
        @keypress="${(t,n)=>t.keypressHandler(n.event)}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
        class="${t=>t.readOnly?"readonly":""} ${t=>t.checked?"checked":""} ${t=>t.indeterminate?"indeterminate":""}"
    >
        <div part="control" class="control">
            <slot name="checked-indicator">
                ${e.checkedIndicator||""}
            </slot>
            <slot name="indeterminate-indicator">
                ${e.indeterminateIndicator||""}
            </slot>
        </div>
        <label
            part="label"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${ie("defaultSlottedNodes")}></slot>
        </label>
    </template>
`;class Ua extends R{}class qa extends oo(Ua){constructor(){super(...arguments),this.proxy=document.createElement("input")}}let ni=class extends qa{constructor(){super(),this.initialValue="on",this.indeterminate=!1,this.keypressHandler=e=>{if(!this.readOnly)switch(e.key){case Ct:this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked;break}},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}};h([p({attribute:"readonly",mode:"boolean"})],ni.prototype,"readOnly",void 0);h([g],ni.prototype,"defaultSlottedNodes",void 0);h([g],ni.prototype,"indeterminate",void 0);function ro(i){return _a(i)&&(i.getAttribute("role")==="option"||i instanceof HTMLOptionElement)}class ve extends R{constructor(e,t,n,s){super(),this.defaultSelected=!1,this.dirtySelected=!1,this.selected=this.defaultSelected,this.dirtyValue=!1,e&&(this.textContent=e),t&&(this.initialValue=t),n&&(this.defaultSelected=n),s&&(this.selected=s),this.proxy=new Option(`${this.textContent}`,this.initialValue,this.defaultSelected,this.selected),this.proxy.disabled=this.disabled}checkedChanged(e,t){if(typeof t=="boolean"){this.ariaChecked=t?"true":"false";return}this.ariaChecked=null}contentChanged(e,t){this.proxy instanceof HTMLOptionElement&&(this.proxy.textContent=this.textContent),this.$emit("contentchange",null,{bubbles:!0})}defaultSelectedChanged(){this.dirtySelected||(this.selected=this.defaultSelected,this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.defaultSelected))}disabledChanged(e,t){this.ariaDisabled=this.disabled?"true":"false",this.proxy instanceof HTMLOptionElement&&(this.proxy.disabled=this.disabled)}selectedAttributeChanged(){this.defaultSelected=this.selectedAttribute,this.proxy instanceof HTMLOptionElement&&(this.proxy.defaultSelected=this.defaultSelected)}selectedChanged(){this.ariaSelected=this.selected?"true":"false",this.dirtySelected||(this.dirtySelected=!0),this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.selected)}initialValueChanged(e,t){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}get label(){var e;return(e=this.value)!==null&&e!==void 0?e:this.text}get text(){var e,t;return(t=(e=this.textContent)===null||e===void 0?void 0:e.replace(/\s+/g," ").trim())!==null&&t!==void 0?t:""}set value(e){const t=`${e??""}`;this._value=t,this.dirtyValue=!0,this.proxy instanceof HTMLOptionElement&&(this.proxy.value=t),w.notify(this,"value")}get value(){var e;return w.track(this,"value"),(e=this._value)!==null&&e!==void 0?e:this.text}get form(){return this.proxy?this.proxy.form:null}}h([g],ve.prototype,"checked",void 0);h([g],ve.prototype,"content",void 0);h([g],ve.prototype,"defaultSelected",void 0);h([p({mode:"boolean"})],ve.prototype,"disabled",void 0);h([p({attribute:"selected",mode:"boolean"})],ve.prototype,"selectedAttribute",void 0);h([g],ve.prototype,"selected",void 0);h([p({attribute:"value",mode:"fromView"})],ve.prototype,"initialValue",void 0);class tt{}h([g],tt.prototype,"ariaChecked",void 0);h([g],tt.prototype,"ariaPosInSet",void 0);h([g],tt.prototype,"ariaSelected",void 0);h([g],tt.prototype,"ariaSetSize",void 0);J(tt,E);J(ve,Ye,tt);class q extends R{constructor(){super(...arguments),this._options=[],this.selectedIndex=-1,this.selectedOptions=[],this.shouldSkipFocus=!1,this.typeaheadBuffer="",this.typeaheadExpired=!0,this.typeaheadTimeout=-1}get firstSelectedOption(){var e;return(e=this.selectedOptions[0])!==null&&e!==void 0?e:null}get hasSelectableOptions(){return this.options.length>0&&!this.options.every(e=>e.disabled)}get length(){var e,t;return(t=(e=this.options)===null||e===void 0?void 0:e.length)!==null&&t!==void 0?t:0}get options(){return w.track(this,"options"),this._options}set options(e){this._options=e,w.notify(this,"options")}get typeAheadExpired(){return this.typeaheadExpired}set typeAheadExpired(e){this.typeaheadExpired=e}clickHandler(e){const t=e.target.closest("option,[role=option]");if(t&&!t.disabled)return this.selectedIndex=this.options.indexOf(t),!0}focusAndScrollOptionIntoView(e=this.firstSelectedOption){this.contains(document.activeElement)&&e!==null&&(e.focus(),requestAnimationFrame(()=>{e.scrollIntoView({block:"nearest"})}))}focusinHandler(e){!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}getTypeaheadMatches(){const e=this.typeaheadBuffer.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),t=new RegExp(`^${e}`,"gi");return this.options.filter(n=>n.text.trim().match(t))}getSelectableIndex(e=this.selectedIndex,t){const n=e>t?-1:e<t?1:0,s=e+n;let o=null;switch(n){case-1:{o=this.options.reduceRight((r,a,l)=>!r&&!a.disabled&&l<s?a:r,o);break}case 1:{o=this.options.reduce((r,a,l)=>!r&&!a.disabled&&l>s?a:r,o);break}}return this.options.indexOf(o)}handleChange(e,t){switch(t){case"selected":{q.slottedOptionFilter(e)&&(this.selectedIndex=this.options.indexOf(e)),this.setSelectedOptions();break}}}handleTypeAhead(e){this.typeaheadTimeout&&window.clearTimeout(this.typeaheadTimeout),this.typeaheadTimeout=window.setTimeout(()=>this.typeaheadExpired=!0,q.TYPE_AHEAD_TIMEOUT_MS),!(e.length>1)&&(this.typeaheadBuffer=`${this.typeaheadExpired?"":this.typeaheadBuffer}${e}`)}keydownHandler(e){if(this.disabled)return!0;this.shouldSkipFocus=!1;const t=e.key;switch(t){case Ke:{e.shiftKey||(e.preventDefault(),this.selectFirstOption());break}case De:{e.shiftKey||(e.preventDefault(),this.selectNextOption());break}case Pe:{e.shiftKey||(e.preventDefault(),this.selectPreviousOption());break}case et:{e.preventDefault(),this.selectLastOption();break}case Ki:return this.focusAndScrollOptionIntoView(),!0;case $t:case ti:return!0;case Ct:if(this.typeaheadExpired)return!0;default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){return this.shouldSkipFocus=!this.contains(document.activeElement),!0}multipleChanged(e,t){this.ariaMultiSelectable=t?"true":null}selectedIndexChanged(e,t){var n;if(!this.hasSelectableOptions){this.selectedIndex=-1;return}if(!((n=this.options[this.selectedIndex])===null||n===void 0)&&n.disabled&&typeof e=="number"){const s=this.getSelectableIndex(e,t),o=s>-1?s:e;this.selectedIndex=o,t===o&&this.selectedIndexChanged(t,o);return}this.setSelectedOptions()}selectedOptionsChanged(e,t){var n;const s=t.filter(q.slottedOptionFilter);(n=this.options)===null||n===void 0||n.forEach(o=>{const r=w.getNotifier(o);r.unsubscribe(this,"selected"),o.selected=s.includes(o),r.subscribe(this,"selected")})}selectFirstOption(){var e,t;this.disabled||(this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(n=>!n.disabled))!==null&&t!==void 0?t:-1)}selectLastOption(){this.disabled||(this.selectedIndex=ya(this.options,e=>!e.disabled))}selectNextOption(){!this.disabled&&this.selectedIndex<this.options.length-1&&(this.selectedIndex+=1)}selectPreviousOption(){!this.disabled&&this.selectedIndex>0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){var e,t;this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(n=>n.defaultSelected))!==null&&t!==void 0?t:-1}setSelectedOptions(){var e,t,n;!((e=this.options)===null||e===void 0)&&e.length&&(this.selectedOptions=[this.options[this.selectedIndex]],this.ariaActiveDescendant=(n=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.id)!==null&&n!==void 0?n:"",this.focusAndScrollOptionIntoView())}slottedOptionsChanged(e,t){this.options=t.reduce((s,o)=>(ro(o)&&s.push(o),s),[]);const n=`${this.options.length}`;this.options.forEach((s,o)=>{s.id||(s.id=Qt("option-")),s.ariaPosInSet=`${o+1}`,s.ariaSetSize=n}),this.$fastController.isConnected&&(this.setSelectedOptions(),this.setDefaultSelectedOption())}typeaheadBufferChanged(e,t){if(this.$fastController.isConnected){const n=this.getTypeaheadMatches();if(n.length){const s=this.options.indexOf(n[0]);s>-1&&(this.selectedIndex=s)}this.typeaheadExpired=!1}}}q.slottedOptionFilter=i=>ro(i)&&!i.hidden;q.TYPE_AHEAD_TIMEOUT_MS=1e3;h([p({mode:"boolean"})],q.prototype,"disabled",void 0);h([g],q.prototype,"selectedIndex",void 0);h([g],q.prototype,"selectedOptions",void 0);h([g],q.prototype,"slottedOptions",void 0);h([g],q.prototype,"typeaheadBuffer",void 0);class Be{}h([g],Be.prototype,"ariaActiveDescendant",void 0);h([g],Be.prototype,"ariaDisabled",void 0);h([g],Be.prototype,"ariaExpanded",void 0);h([g],Be.prototype,"ariaMultiSelectable",void 0);J(Be,E);J(q,Be);const yi={above:"above",below:"below"};function Pi(i){const e=i.parentElement;if(e)return e;{const t=i.getRootNode();if(t.host instanceof HTMLElement)return t.host}return null}function Wa(i,e){let t=e;for(;t!==null;){if(t===i)return!0;t=Pi(t)}return!1}const fe=document.createElement("div");function Ga(i){return i instanceof ei}class tn{setProperty(e,t){$.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){$.queueUpdate(()=>this.target.removeProperty(e))}}class Qa extends tn{constructor(e){super();const t=new CSSStyleSheet;this.target=t.cssRules[t.insertRule(":host{}")].style,e.$fastController.addStyles(Y.create([t]))}}class Xa extends tn{constructor(){super();const e=new CSSStyleSheet;this.target=e.cssRules[e.insertRule(":root{}")].style,document.adoptedStyleSheets=[...document.adoptedStyleSheets,e]}}class Ya extends tn{constructor(){super(),this.style=document.createElement("style"),document.head.appendChild(this.style);const{sheet:e}=this.style;if(e){const t=e.insertRule(":root{}",e.cssRules.length);this.target=e.cssRules[t].style}}}class ao{constructor(e){this.store=new Map,this.target=null;const t=e.$fastController;this.style=document.createElement("style"),t.addStyles(this.style),w.getNotifier(t).subscribe(this,"isConnected"),this.handleChange(t,"isConnected")}targetChanged(){if(this.target!==null)for(const[e,t]of this.store.entries())this.target.setProperty(e,t)}setProperty(e,t){this.store.set(e,t),$.queueUpdate(()=>{this.target!==null&&this.target.setProperty(e,t)})}removeProperty(e){this.store.delete(e),$.queueUpdate(()=>{this.target!==null&&this.target.removeProperty(e)})}handleChange(e,t){const{sheet:n}=this.style;if(n){const s=n.insertRule(":host{}",n.cssRules.length);this.target=n.cssRules[s].style}else this.target=null}}h([g],ao.prototype,"target",void 0);class Za{constructor(e){this.target=e.style}setProperty(e,t){$.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){$.queueUpdate(()=>this.target.removeProperty(e))}}class H{setProperty(e,t){H.properties[e]=t;for(const n of H.roots.values())He.getOrCreate(H.normalizeRoot(n)).setProperty(e,t)}removeProperty(e){delete H.properties[e];for(const t of H.roots.values())He.getOrCreate(H.normalizeRoot(t)).removeProperty(e)}static registerRoot(e){const{roots:t}=H;if(!t.has(e)){t.add(e);const n=He.getOrCreate(this.normalizeRoot(e));for(const s in H.properties)n.setProperty(s,H.properties[s])}}static unregisterRoot(e){const{roots:t}=H;if(t.has(e)){t.delete(e);const n=He.getOrCreate(H.normalizeRoot(e));for(const s in H.properties)n.removeProperty(s)}}static normalizeRoot(e){return e===fe?document:e}}H.roots=new Set;H.properties={};const xi=new WeakMap,Ja=$.supportsAdoptedStyleSheets?Qa:ao,He=Object.freeze({getOrCreate(i){if(xi.has(i))return xi.get(i);let e;return i===fe?e=new H:i instanceof Document?e=$.supportsAdoptedStyleSheets?new Xa:new Ya:Ga(i)?e=new Ja(i):e=new Za(i),xi.set(i,e),e}});class U extends qs{constructor(e){super(),this.subscribers=new WeakMap,this._appliedTo=new Set,this.name=e.name,e.cssCustomPropertyName!==null&&(this.cssCustomProperty=`--${e.cssCustomPropertyName}`,this.cssVar=`var(${this.cssCustomProperty})`),this.id=U.uniqueId(),U.tokensById.set(this.id,this)}get appliedTo(){return[...this._appliedTo]}static from(e){return new U({name:typeof e=="string"?e:e.name,cssCustomPropertyName:typeof e=="string"?e:e.cssCustomPropertyName===void 0?e.name:e.cssCustomPropertyName})}static isCSSDesignToken(e){return typeof e.cssCustomProperty=="string"}static isDerivedDesignTokenValue(e){return typeof e=="function"}static getTokenById(e){return U.tokensById.get(e)}getOrCreateSubscriberSet(e=this){return this.subscribers.get(e)||this.subscribers.set(e,new Set)&&this.subscribers.get(e)}createCSS(){return this.cssVar||""}getValueFor(e){const t=P.getOrCreate(e).get(this);if(t!==void 0)return t;throw new Error(`Value could not be retrieved for token named "${this.name}". Ensure the value is set for ${e} or an ancestor of ${e}.`)}setValueFor(e,t){return this._appliedTo.add(e),t instanceof U&&(t=this.alias(t)),P.getOrCreate(e).set(this,t),this}deleteValueFor(e){return this._appliedTo.delete(e),P.existsFor(e)&&P.getOrCreate(e).delete(this),this}withDefault(e){return this.setValueFor(fe,e),this}subscribe(e,t){const n=this.getOrCreateSubscriberSet(t);t&&!P.existsFor(t)&&P.getOrCreate(t),n.has(e)||n.add(e)}unsubscribe(e,t){const n=this.subscribers.get(t||this);n&&n.has(e)&&n.delete(e)}notify(e){const t=Object.freeze({token:this,target:e});this.subscribers.has(this)&&this.subscribers.get(this).forEach(n=>n.handleChange(t)),this.subscribers.has(e)&&this.subscribers.get(e).forEach(n=>n.handleChange(t))}alias(e){return t=>e.getValueFor(t)}}U.uniqueId=(()=>{let i=0;return()=>(i++,i.toString(16))})();U.tokensById=new Map;class Ka{startReflection(e,t){e.subscribe(this,t),this.handleChange({token:e,target:t})}stopReflection(e,t){e.unsubscribe(this,t),this.remove(e,t)}handleChange(e){const{token:t,target:n}=e;this.add(t,n)}add(e,t){He.getOrCreate(t).setProperty(e.cssCustomProperty,this.resolveCSSValue(P.getOrCreate(t).get(e)))}remove(e,t){He.getOrCreate(t).removeProperty(e.cssCustomProperty)}resolveCSSValue(e){return e&&typeof e.createCSS=="function"?e.createCSS():e}}class el{constructor(e,t,n){this.source=e,this.token=t,this.node=n,this.dependencies=new Set,this.observer=w.binding(e,this,!1),this.observer.handleChange=this.observer.call,this.handleChange()}disconnect(){this.observer.disconnect()}handleChange(){this.node.store.set(this.token,this.observer.observe(this.node.target,ht))}}class tl{constructor(){this.values=new Map}set(e,t){this.values.get(e)!==t&&(this.values.set(e,t),w.getNotifier(this).notify(e.id))}get(e){return w.track(this,e.id),this.values.get(e)}delete(e){this.values.delete(e)}all(){return this.values.entries()}}const ot=new WeakMap,rt=new WeakMap;class P{constructor(e){this.target=e,this.store=new tl,this.children=[],this.assignedValues=new Map,this.reflecting=new Set,this.bindingObservers=new Map,this.tokenValueChangeHandler={handleChange:(t,n)=>{const s=U.getTokenById(n);s&&(s.notify(this.target),this.updateCSSTokenReflection(t,s))}},ot.set(e,this),w.getNotifier(this.store).subscribe(this.tokenValueChangeHandler),e instanceof ei?e.$fastController.addBehaviors([this]):e.isConnected&&this.bind()}static getOrCreate(e){return ot.get(e)||new P(e)}static existsFor(e){return ot.has(e)}static findParent(e){if(fe!==e.target){let t=Pi(e.target);for(;t!==null;){if(ot.has(t))return ot.get(t);t=Pi(t)}return P.getOrCreate(fe)}return null}static findClosestAssignedNode(e,t){let n=t;do{if(n.has(e))return n;n=n.parent?n.parent:n.target!==fe?P.getOrCreate(fe):null}while(n!==null);return null}get parent(){return rt.get(this)||null}updateCSSTokenReflection(e,t){if(U.isCSSDesignToken(t)){const n=this.parent,s=this.isReflecting(t);if(n){const o=n.get(t),r=e.get(t);o!==r&&!s?this.reflectToCSS(t):o===r&&s&&this.stopReflectToCSS(t)}else s||this.reflectToCSS(t)}}has(e){return this.assignedValues.has(e)}get(e){const t=this.store.get(e);if(t!==void 0)return t;const n=this.getRaw(e);if(n!==void 0)return this.hydrate(e,n),this.get(e)}getRaw(e){var t;return this.assignedValues.has(e)?this.assignedValues.get(e):(t=P.findClosestAssignedNode(e,this))===null||t===void 0?void 0:t.getRaw(e)}set(e,t){U.isDerivedDesignTokenValue(this.assignedValues.get(e))&&this.tearDownBindingObserver(e),this.assignedValues.set(e,t),U.isDerivedDesignTokenValue(t)?this.setupBindingObserver(e,t):this.store.set(e,t)}delete(e){this.assignedValues.delete(e),this.tearDownBindingObserver(e);const t=this.getRaw(e);t?this.hydrate(e,t):this.store.delete(e)}bind(){const e=P.findParent(this);e&&e.appendChild(this);for(const t of this.assignedValues.keys())t.notify(this.target)}unbind(){this.parent&&rt.get(this).removeChild(this)}appendChild(e){e.parent&&rt.get(e).removeChild(e);const t=this.children.filter(n=>e.contains(n));rt.set(e,this),this.children.push(e),t.forEach(n=>e.appendChild(n)),w.getNotifier(this.store).subscribe(e);for(const[n,s]of this.store.all())e.hydrate(n,this.bindingObservers.has(n)?this.getRaw(n):s)}removeChild(e){const t=this.children.indexOf(e);return t!==-1&&this.children.splice(t,1),w.getNotifier(this.store).unsubscribe(e),e.parent===this?rt.delete(e):!1}contains(e){return Wa(this.target,e.target)}reflectToCSS(e){this.isReflecting(e)||(this.reflecting.add(e),P.cssCustomPropertyReflector.startReflection(e,this.target))}stopReflectToCSS(e){this.isReflecting(e)&&(this.reflecting.delete(e),P.cssCustomPropertyReflector.stopReflection(e,this.target))}isReflecting(e){return this.reflecting.has(e)}handleChange(e,t){const n=U.getTokenById(t);n&&(this.hydrate(n,this.getRaw(n)),this.updateCSSTokenReflection(this.store,n))}hydrate(e,t){if(!this.has(e)){const n=this.bindingObservers.get(e);U.isDerivedDesignTokenValue(t)?n?n.source!==t&&(this.tearDownBindingObserver(e),this.setupBindingObserver(e,t)):this.setupBindingObserver(e,t):(n&&this.tearDownBindingObserver(e),this.store.set(e,t))}}setupBindingObserver(e,t){const n=new el(t,e,this);return this.bindingObservers.set(e,n),n}tearDownBindingObserver(e){return this.bindingObservers.has(e)?(this.bindingObservers.get(e).disconnect(),this.bindingObservers.delete(e),!0):!1}}P.cssCustomPropertyReflector=new Ka;h([g],P.prototype,"children",void 0);function il(i){return U.from(i)}const lo=Object.freeze({create:il,notifyConnection(i){return!i.isConnected||!P.existsFor(i)?!1:(P.getOrCreate(i).bind(),!0)},notifyDisconnection(i){return i.isConnected||!P.existsFor(i)?!1:(P.getOrCreate(i).unbind(),!0)},registerRoot(i=fe){H.registerRoot(i)},unregisterRoot(i=fe){H.unregisterRoot(i)}}),_i=Object.freeze({definitionCallbackOnly:null,ignoreDuplicate:Symbol()}),wi=new Map,zt=new Map;let Ne=null;const at=A.createInterface(i=>i.cachedCallback(e=>(Ne===null&&(Ne=new ho(null,e)),Ne))),co=Object.freeze({tagFor(i){return zt.get(i)},responsibleFor(i){const e=i.$$designSystem$$;return e||A.findResponsibleContainer(i).get(at)},getOrCreate(i){if(!i)return Ne===null&&(Ne=A.getOrCreateDOMContainer().get(at)),Ne;const e=i.$$designSystem$$;if(e)return e;const t=A.getOrCreateDOMContainer(i);if(t.has(at,!1))return t.get(at);{const n=new ho(i,t);return t.register(vt.instance(at,n)),n}}});function nl(i,e,t){return typeof i=="string"?{name:i,type:e,callback:t}:i}class ho{constructor(e,t){this.owner=e,this.container=t,this.designTokensInitialized=!1,this.prefix="fast",this.shadowRootMode=void 0,this.disambiguate=()=>_i.definitionCallbackOnly,e!==null&&(e.$$designSystem$$=this)}withPrefix(e){return this.prefix=e,this}withShadowRootMode(e){return this.shadowRootMode=e,this}withElementDisambiguation(e){return this.disambiguate=e,this}withDesignTokenRoot(e){return this.designTokenRoot=e,this}register(...e){const t=this.container,n=[],s=this.disambiguate,o=this.shadowRootMode,r={elementPrefix:this.prefix,tryDefineElement(a,l,d){const u=nl(a,l,d),{name:c,callback:f,baseClass:b}=u;let{type:y}=u,T=c,I=wi.get(T),C=!0;for(;I;){const _=s(T,y,I);switch(_){case _i.ignoreDuplicate:return;case _i.definitionCallbackOnly:C=!1,I=void 0;break;default:T=_,I=wi.get(T);break}}C&&((zt.has(y)||y===R)&&(y=class extends y{}),wi.set(T,y),zt.set(y,T),b&&zt.set(b,T)),n.push(new sl(t,T,y,o,f,C))}};this.designTokensInitialized||(this.designTokensInitialized=!0,this.designTokenRoot!==null&&lo.registerRoot(this.designTokenRoot)),t.registerWithContext(r,...e);for(const a of n)a.callback(a),a.willDefine&&a.definition!==null&&a.definition.define();return this}}class sl{constructor(e,t,n,s,o,r){this.container=e,this.name=t,this.type=n,this.shadowRootMode=s,this.callback=o,this.willDefine=r,this.definition=null}definePresentation(e){io.define(this.name,e,this.container)}defineElement(e){this.definition=new wt(this.type,Object.assign(Object.assign({},e),{name:this.name}))}tagFor(e){return co.tagFor(e)}}const ol=(i,e)=>S`
    <template role="${t=>t.role}" aria-orientation="${t=>t.orientation}"></template>
`,rl={separator:"separator",presentation:"presentation"};let nn=class extends R{constructor(){super(...arguments),this.role=rl.separator,this.orientation=Ji.horizontal}};h([p],nn.prototype,"role",void 0);h([p],nn.prototype,"orientation",void 0);const al=(i,e)=>S`
    <template
        aria-checked="${t=>t.ariaChecked}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-posinset="${t=>t.ariaPosInSet}"
        aria-selected="${t=>t.ariaSelected}"
        aria-setsize="${t=>t.ariaSetSize}"
        class="${t=>[t.checked&&"checked",t.selected&&"selected",t.disabled&&"disabled"].filter(Boolean).join(" ")}"
        role="option"
    >
        ${Je(i,e)}
        <span class="content" part="content">
            <slot ${ie("content")}></slot>
        </span>
        ${Ze(i,e)}
    </template>
`;class si extends q{constructor(){super(...arguments),this.activeIndex=-1,this.rangeStartIndex=-1}get activeOption(){return this.options[this.activeIndex]}get checkedOptions(){var e;return(e=this.options)===null||e===void 0?void 0:e.filter(t=>t.checked)}get firstSelectedOptionIndex(){return this.options.indexOf(this.firstSelectedOption)}activeIndexChanged(e,t){var n,s;this.ariaActiveDescendant=(s=(n=this.options[t])===null||n===void 0?void 0:n.id)!==null&&s!==void 0?s:"",this.focusAndScrollOptionIntoView()}checkActiveIndex(){if(!this.multiple)return;const e=this.activeOption;e&&(e.checked=!0)}checkFirstOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex+1),this.options.forEach((t,n)=>{t.checked=Pt(n,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex=0,this.checkActiveIndex()}checkLastOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,n)=>{t.checked=Pt(n,this.rangeStartIndex,this.options.length)})):this.uncheckAllOptions(),this.activeIndex=this.options.length-1,this.checkActiveIndex()}connectedCallback(){super.connectedCallback(),this.addEventListener("focusout",this.focusoutHandler)}disconnectedCallback(){this.removeEventListener("focusout",this.focusoutHandler),super.disconnectedCallback()}checkNextOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,n)=>{t.checked=Pt(n,this.rangeStartIndex,this.activeIndex+1)})):this.uncheckAllOptions(),this.activeIndex+=this.activeIndex<this.options.length-1?1:0,this.checkActiveIndex()}checkPreviousOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.checkedOptions.length===1&&(this.rangeStartIndex+=1),this.options.forEach((t,n)=>{t.checked=Pt(n,this.activeIndex,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex-=this.activeIndex>0?1:0,this.checkActiveIndex()}clickHandler(e){var t;if(!this.multiple)return super.clickHandler(e);const n=(t=e.target)===null||t===void 0?void 0:t.closest("[role=option]");if(!(!n||n.disabled))return this.uncheckAllOptions(),this.activeIndex=this.options.indexOf(n),this.checkActiveIndex(),this.toggleSelectedForAllCheckedOptions(),!0}focusAndScrollOptionIntoView(){super.focusAndScrollOptionIntoView(this.activeOption)}focusinHandler(e){if(!this.multiple)return super.focusinHandler(e);!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.uncheckAllOptions(),this.activeIndex===-1&&(this.activeIndex=this.firstSelectedOptionIndex!==-1?this.firstSelectedOptionIndex:0),this.checkActiveIndex(),this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}focusoutHandler(e){this.multiple&&this.uncheckAllOptions()}keydownHandler(e){if(!this.multiple)return super.keydownHandler(e);if(this.disabled)return!0;const{key:t,shiftKey:n}=e;switch(this.shouldSkipFocus=!1,t){case Ke:{this.checkFirstOption(n);return}case De:{this.checkNextOption(n);return}case Pe:{this.checkPreviousOption(n);return}case et:{this.checkLastOption(n);return}case Ki:return this.focusAndScrollOptionIntoView(),!0;case ti:return this.uncheckAllOptions(),this.checkActiveIndex(),!0;case Ct:if(e.preventDefault(),this.typeAheadExpired){this.toggleSelectedForAllCheckedOptions();return}default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){if(e.offsetX>=0&&e.offsetX<=this.scrollWidth)return super.mousedownHandler(e)}multipleChanged(e,t){var n;this.ariaMultiSelectable=t?"true":null,(n=this.options)===null||n===void 0||n.forEach(s=>{s.checked=t?!1:void 0}),this.setSelectedOptions()}setSelectedOptions(){if(!this.multiple){super.setSelectedOptions();return}this.$fastController.isConnected&&this.options&&(this.selectedOptions=this.options.filter(e=>e.selected),this.focusAndScrollOptionIntoView())}sizeChanged(e,t){var n;const s=Math.max(0,parseInt((n=t==null?void 0:t.toFixed())!==null&&n!==void 0?n:"",10));s!==t&&$.queueUpdate(()=>{this.size=s})}toggleSelectedForAllCheckedOptions(){const e=this.checkedOptions.filter(n=>!n.disabled),t=!e.every(n=>n.selected);e.forEach(n=>n.selected=t),this.selectedIndex=this.options.indexOf(e[e.length-1]),this.setSelectedOptions()}typeaheadBufferChanged(e,t){if(!this.multiple){super.typeaheadBufferChanged(e,t);return}if(this.$fastController.isConnected){const n=this.getTypeaheadMatches(),s=this.options.indexOf(n[0]);s>-1&&(this.activeIndex=s,this.uncheckAllOptions(),this.checkActiveIndex()),this.typeAheadExpired=!1}}uncheckAllOptions(e=!1){this.options.forEach(t=>t.checked=this.multiple?!1:void 0),e||(this.rangeStartIndex=-1)}}h([g],si.prototype,"activeIndex",void 0);h([p({mode:"boolean"})],si.prototype,"multiple",void 0);h([p({converter:ae})],si.prototype,"size",void 0);class ll extends R{}class cl extends Tt(ll){constructor(){super(...arguments),this.proxy=document.createElement("input")}}const dl={email:"email",password:"password",tel:"tel",text:"text",url:"url"};let K=class extends cl{constructor(){super(...arguments),this.type=dl.text}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}typeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type,this.validate())}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.validate(),this.autofocus&&$.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.value=this.control.value}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};h([p({attribute:"readonly",mode:"boolean"})],K.prototype,"readOnly",void 0);h([p({mode:"boolean"})],K.prototype,"autofocus",void 0);h([p],K.prototype,"placeholder",void 0);h([p],K.prototype,"type",void 0);h([p],K.prototype,"list",void 0);h([p({converter:ae})],K.prototype,"maxlength",void 0);h([p({converter:ae})],K.prototype,"minlength",void 0);h([p],K.prototype,"pattern",void 0);h([p({converter:ae})],K.prototype,"size",void 0);h([p({mode:"boolean"})],K.prototype,"spellcheck",void 0);h([g],K.prototype,"defaultSlottedNodes",void 0);class sn{}J(sn,E);J(K,Ye,sn);const Jn=44,hl=(i,e)=>S`
    <template
        role="progressbar"
        aria-valuenow="${t=>t.value}"
        aria-valuemin="${t=>t.min}"
        aria-valuemax="${t=>t.max}"
        class="${t=>t.paused?"paused":""}"
    >
        ${Yi(t=>typeof t.value=="number",S`
                <svg
                    class="progress"
                    part="progress"
                    viewBox="0 0 16 16"
                    slot="determinate"
                >
                    <circle
                        class="background"
                        part="background"
                        cx="8px"
                        cy="8px"
                        r="7px"
                    ></circle>
                    <circle
                        class="determinate"
                        part="determinate"
                        style="stroke-dasharray: ${t=>Jn*t.percentComplete/100}px ${Jn}px"
                        cx="8px"
                        cy="8px"
                        r="7px"
                    ></circle>
                </svg>
            `,S`
                <slot name="indeterminate" slot="indeterminate">
                    ${e.indeterminateIndicator||""}
                </slot>
            `)}
    </template>
`;class it extends R{constructor(){super(...arguments),this.percentComplete=0}valueChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}minChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}maxChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}connectedCallback(){super.connectedCallback(),this.updatePercentComplete()}updatePercentComplete(){const e=typeof this.min=="number"?this.min:0,t=typeof this.max=="number"?this.max:100,n=typeof this.value=="number"?this.value:0,s=t-e;this.percentComplete=s===0?0:Math.fround((n-e)/s*100)}}h([p({converter:ae})],it.prototype,"value",void 0);h([p({converter:ae})],it.prototype,"min",void 0);h([p({converter:ae})],it.prototype,"max",void 0);h([p({mode:"boolean"})],it.prototype,"paused",void 0);h([g],it.prototype,"percentComplete",void 0);const ul=(i,e)=>S`
    <template
        role="radiogroup"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
        @keydown="${(t,n)=>t.keydownHandler(n.event)}"
        @focusout="${(t,n)=>t.focusOutHandler(n.event)}"
    >
        <slot name="label"></slot>
        <div
            class="positioning-region ${t=>t.orientation===Ji.horizontal?"horizontal":"vertical"}"
            part="positioning-region"
        >
            <slot
                ${ie({property:"slottedRadioButtons",filter:Zi("[role=radio]")})}
            ></slot>
        </div>
    </template>
`;let Te=class extends R{constructor(){super(...arguments),this.orientation=Ji.horizontal,this.radioChangeHandler=e=>{const t=e.target;t.checked&&(this.slottedRadioButtons.forEach(n=>{n!==t&&(n.checked=!1,this.isInsideFoundationToolbar||n.setAttribute("tabindex","-1"))}),this.selectedRadio=t,this.value=t.value,t.setAttribute("tabindex","0"),this.focusedRadio=t),e.stopPropagation()},this.moveToRadioByIndex=(e,t)=>{const n=e[t];this.isInsideToolbar||(n.setAttribute("tabindex","0"),n.readOnly?this.slottedRadioButtons.forEach(s=>{s!==n&&s.setAttribute("tabindex","-1")}):(n.checked=!0,this.selectedRadio=n)),this.focusedRadio=n,n.focus()},this.moveRightOffGroup=()=>{var e;(e=this.nextElementSibling)===null||e===void 0||e.focus()},this.moveLeftOffGroup=()=>{var e;(e=this.previousElementSibling)===null||e===void 0||e.focus()},this.focusOutHandler=e=>{const t=this.slottedRadioButtons,n=e.target,s=n!==null?t.indexOf(n):0,o=this.focusedRadio?t.indexOf(this.focusedRadio):-1;return(o===0&&s===o||o===t.length-1&&o===s)&&(this.selectedRadio?(this.focusedRadio=this.selectedRadio,this.isInsideFoundationToolbar||(this.selectedRadio.setAttribute("tabindex","0"),t.forEach(r=>{r!==this.selectedRadio&&r.setAttribute("tabindex","-1")}))):(this.focusedRadio=t[0],this.focusedRadio.setAttribute("tabindex","0"),t.forEach(r=>{r!==this.focusedRadio&&r.setAttribute("tabindex","-1")}))),!0},this.clickHandler=e=>{const t=e.target;if(t){const n=this.slottedRadioButtons;t.checked||n.indexOf(t)===0?(t.setAttribute("tabindex","0"),this.selectedRadio=t):(t.setAttribute("tabindex","-1"),this.selectedRadio=null),this.focusedRadio=t}e.preventDefault()},this.shouldMoveOffGroupToTheRight=(e,t,n)=>e===t.length&&this.isInsideToolbar&&n===xt,this.shouldMoveOffGroupToTheLeft=(e,t)=>(this.focusedRadio?e.indexOf(this.focusedRadio)-1:0)<0&&this.isInsideToolbar&&t===yt,this.checkFocusedRadio=()=>{this.focusedRadio!==null&&!this.focusedRadio.readOnly&&!this.focusedRadio.checked&&(this.focusedRadio.checked=!0,this.focusedRadio.setAttribute("tabindex","0"),this.focusedRadio.focus(),this.selectedRadio=this.focusedRadio)},this.moveRight=e=>{const t=this.slottedRadioButtons;let n=0;if(n=this.focusedRadio?t.indexOf(this.focusedRadio)+1:1,this.shouldMoveOffGroupToTheRight(n,t,e.key)){this.moveRightOffGroup();return}else n===t.length&&(n=0);for(;n<t.length&&t.length>1;)if(t[n].disabled){if(this.focusedRadio&&n===t.indexOf(this.focusedRadio))break;if(n+1>=t.length){if(this.isInsideToolbar)break;n=0}else n+=1}else{this.moveToRadioByIndex(t,n);break}},this.moveLeft=e=>{const t=this.slottedRadioButtons;let n=0;if(n=this.focusedRadio?t.indexOf(this.focusedRadio)-1:0,n=n<0?t.length-1:n,this.shouldMoveOffGroupToTheLeft(t,e.key)){this.moveLeftOffGroup();return}for(;n>=0&&t.length>1;)if(t[n].disabled){if(this.focusedRadio&&n===t.indexOf(this.focusedRadio))break;n-1<0?n=t.length-1:n-=1}else{this.moveToRadioByIndex(t,n);break}},this.keydownHandler=e=>{const t=e.key;if(t in Ia&&this.isInsideFoundationToolbar)return!0;switch(t){case $t:{this.checkFocusedRadio();break}case xt:case De:{this.direction===Qe.ltr?this.moveRight(e):this.moveLeft(e);break}case yt:case Pe:{this.direction===Qe.ltr?this.moveLeft(e):this.moveRight(e);break}default:return!0}}}readOnlyChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.readOnly?e.readOnly=!0:e.readOnly=!1})}disabledChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.disabled?e.disabled=!0:e.disabled=!1})}nameChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.setAttribute("name",this.name)})}valueChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.value===this.value&&(e.checked=!0,this.selectedRadio=e)}),this.$emit("change")}slottedRadioButtonsChanged(e,t){this.slottedRadioButtons&&this.slottedRadioButtons.length>0&&this.setupRadioButtons()}get parentToolbar(){return this.closest('[role="toolbar"]')}get isInsideToolbar(){var e;return(e=this.parentToolbar)!==null&&e!==void 0?e:!1}get isInsideFoundationToolbar(){var e;return!!(!((e=this.parentToolbar)===null||e===void 0)&&e.$fastController)}connectedCallback(){super.connectedCallback(),this.direction=Ea(this),this.setupRadioButtons()}disconnectedCallback(){this.slottedRadioButtons.forEach(e=>{e.removeEventListener("change",this.radioChangeHandler)})}setupRadioButtons(){const e=this.slottedRadioButtons.filter(s=>s.hasAttribute("checked")),t=e?e.length:0;if(t>1){const s=e[t-1];s.checked=!0}let n=!1;if(this.slottedRadioButtons.forEach(s=>{this.name!==void 0&&s.setAttribute("name",this.name),this.disabled&&(s.disabled=!0),this.readOnly&&(s.readOnly=!0),this.value&&this.value===s.value?(this.selectedRadio=s,this.focusedRadio=s,s.checked=!0,s.setAttribute("tabindex","0"),n=!0):(this.isInsideFoundationToolbar||s.setAttribute("tabindex","-1"),s.checked=!1),s.addEventListener("change",this.radioChangeHandler)}),this.value===void 0&&this.slottedRadioButtons.length>0){const s=this.slottedRadioButtons.filter(r=>r.hasAttribute("checked")),o=s!==null?s.length:0;if(o>0&&!n){const r=s[o-1];r.checked=!0,this.focusedRadio=r,r.setAttribute("tabindex","0")}else this.slottedRadioButtons[0].setAttribute("tabindex","0"),this.focusedRadio=this.slottedRadioButtons[0]}}};h([p({attribute:"readonly",mode:"boolean"})],Te.prototype,"readOnly",void 0);h([p({attribute:"disabled",mode:"boolean"})],Te.prototype,"disabled",void 0);h([p],Te.prototype,"name",void 0);h([p],Te.prototype,"value",void 0);h([p],Te.prototype,"orientation",void 0);h([g],Te.prototype,"childItems",void 0);h([g],Te.prototype,"slottedRadioButtons",void 0);const pl=(i,e)=>S`
    <template
        role="radio"
        class="${t=>t.checked?"checked":""} ${t=>t.readOnly?"readonly":""}"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @keypress="${(t,n)=>t.keypressHandler(n.event)}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
    >
        <div part="control" class="control">
            <slot name="checked-indicator">
                ${e.checkedIndicator||""}
            </slot>
        </div>
        <label
            part="label"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${ie("defaultSlottedNodes")}></slot>
        </label>
    </template>
`;class fl extends R{}class bl extends oo(fl){constructor(){super(...arguments),this.proxy=document.createElement("input")}}let oi=class extends bl{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{switch(e.key){case Ct:!this.checked&&!this.readOnly&&(this.checked=!0);return}return!0},this.proxy.setAttribute("type","radio")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}defaultCheckedChanged(){var e;this.$fastController.isConnected&&!this.dirtyChecked&&(this.isInsideRadioGroup()||(this.checked=(e=this.defaultChecked)!==null&&e!==void 0?e:!1,this.dirtyChecked=!1))}connectedCallback(){var e,t;super.connectedCallback(),this.validate(),((e=this.parentElement)===null||e===void 0?void 0:e.getAttribute("role"))!=="radiogroup"&&this.getAttribute("tabindex")===null&&(this.disabled||this.setAttribute("tabindex","0")),this.checkedAttribute&&(this.dirtyChecked||this.isInsideRadioGroup()||(this.checked=(t=this.defaultChecked)!==null&&t!==void 0?t:!1,this.dirtyChecked=!1))}isInsideRadioGroup(){return this.closest("[role=radiogroup]")!==null}clickHandler(e){!this.disabled&&!this.readOnly&&!this.checked&&(this.checked=!0)}};h([p({attribute:"readonly",mode:"boolean"})],oi.prototype,"readOnly",void 0);h([g],oi.prototype,"name",void 0);h([g],oi.prototype,"defaultSlottedNodes",void 0);function ml(i,e,t){return i.nodeType!==Node.TEXT_NODE?!0:typeof i.nodeValue=="string"&&!!i.nodeValue.trim().length}class gl extends si{}class vl extends Tt(gl){constructor(){super(...arguments),this.proxy=document.createElement("select")}}class Ie extends vl{constructor(){super(...arguments),this.open=!1,this.forcedPosition=!1,this.listboxId=Qt("listbox-"),this.maxHeight=0}openChanged(e,t){if(this.collapsible){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),this.indexWhenOpened=this.selectedIndex,$.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}}get collapsible(){return!(this.multiple||typeof this.size=="number")}get value(){return w.track(this,"value"),this._value}set value(e){var t,n,s,o,r,a,l;const d=`${this._value}`;if(!((t=this._options)===null||t===void 0)&&t.length){const u=this._options.findIndex(b=>b.value===e),c=(s=(n=this._options[this.selectedIndex])===null||n===void 0?void 0:n.value)!==null&&s!==void 0?s:null,f=(r=(o=this._options[u])===null||o===void 0?void 0:o.value)!==null&&r!==void 0?r:null;(u===-1||c!==f)&&(e="",this.selectedIndex=u),e=(l=(a=this.firstSelectedOption)===null||a===void 0?void 0:a.value)!==null&&l!==void 0?l:e}d!==e&&(this._value=e,super.valueChanged(d,e),w.notify(this,"value"),this.updateDisplayValue())}updateValue(e){var t,n;this.$fastController.isConnected&&(this.value=(n=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.value)!==null&&n!==void 0?n:""),e&&(this.$emit("input"),this.$emit("change",this,{bubbles:!0,composed:void 0}))}selectedIndexChanged(e,t){super.selectedIndexChanged(e,t),this.updateValue()}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}setPositioning(){const e=this.getBoundingClientRect(),n=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>n?yi.above:yi.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===yi.above?~~e.top:~~n}get displayValue(){var e,t;return w.track(this,"displayValue"),(t=(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text)!==null&&t!==void 0?t:""}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}formResetCallback(){this.setProxyOptions(),super.setDefaultSelectedOption(),this.selectedIndex===-1&&(this.selectedIndex=0)}clickHandler(e){if(!this.disabled){if(this.open){const t=e.target.closest("option,[role=option]");if(t&&t.disabled)return}return super.clickHandler(e),this.open=this.collapsible&&!this.open,!this.open&&this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0),!0}}focusoutHandler(e){var t;if(super.focusoutHandler(e),!this.open)return!0;const n=e.relatedTarget;if(this.isSameNode(n)){this.focus();return}!((t=this.options)===null||t===void 0)&&t.includes(n)||(this.open=!1,this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0))}handleChange(e,t){super.handleChange(e,t),t==="value"&&this.updateValue()}slottedOptionsChanged(e,t){this.options.forEach(n=>{w.getNotifier(n).unsubscribe(this,"value")}),super.slottedOptionsChanged(e,t),this.options.forEach(n=>{w.getNotifier(n).subscribe(this,"value")}),this.setProxyOptions(),this.updateValue()}mousedownHandler(e){var t;return e.offsetX>=0&&e.offsetX<=((t=this.listbox)===null||t===void 0?void 0:t.scrollWidth)?super.mousedownHandler(e):this.collapsible}multipleChanged(e,t){super.multipleChanged(e,t),this.proxy&&(this.proxy.multiple=t)}selectedOptionsChanged(e,t){var n;super.selectedOptionsChanged(e,t),(n=this.options)===null||n===void 0||n.forEach((s,o)=>{var r;const a=(r=this.proxy)===null||r===void 0?void 0:r.options.item(o);a&&(a.selected=s.selected)})}setDefaultSelectedOption(){var e;const t=(e=this.options)!==null&&e!==void 0?e:Array.from(this.children).filter(q.slottedOptionFilter),n=t==null?void 0:t.findIndex(s=>s.hasAttribute("selected")||s.selected||s.value===this.value);if(n!==-1){this.selectedIndex=n;return}this.selectedIndex=0}setProxyOptions(){this.proxy instanceof HTMLSelectElement&&this.options&&(this.proxy.options.length=0,this.options.forEach(e=>{const t=e.proxy||(e instanceof HTMLOptionElement?e.cloneNode():null);t&&this.proxy.options.add(t)}))}keydownHandler(e){super.keydownHandler(e);const t=e.key||e.key.charCodeAt(0);switch(t){case Ct:{e.preventDefault(),this.collapsible&&this.typeAheadExpired&&(this.open=!this.open);break}case Ke:case et:{e.preventDefault();break}case $t:{e.preventDefault(),this.open=!this.open;break}case ti:{this.collapsible&&this.open&&(e.preventDefault(),this.open=!1);break}case Ki:return this.collapsible&&this.open&&(e.preventDefault(),this.open=!1),!0}return!this.open&&this.indexWhenOpened!==this.selectedIndex&&(this.updateValue(!0),this.indexWhenOpened=this.selectedIndex),!(t===De||t===Pe)}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.addEventListener("contentchange",this.updateDisplayValue)}disconnectedCallback(){this.removeEventListener("contentchange",this.updateDisplayValue),super.disconnectedCallback()}sizeChanged(e,t){super.sizeChanged(e,t),this.proxy&&(this.proxy.size=t)}updateDisplayValue(){this.collapsible&&w.notify(this,"displayValue")}}h([p({attribute:"open",mode:"boolean"})],Ie.prototype,"open",void 0);h([_r],Ie.prototype,"collapsible",null);h([g],Ie.prototype,"control",void 0);h([p({attribute:"position"})],Ie.prototype,"positionAttribute",void 0);h([g],Ie.prototype,"position",void 0);h([g],Ie.prototype,"maxHeight",void 0);class on{}h([g],on.prototype,"ariaControls",void 0);J(on,Be);J(Ie,Ye,on);const yl=(i,e)=>S`
    <template
        class="${t=>[t.collapsible&&"collapsible",t.collapsible&&t.open&&"open",t.disabled&&"disabled",t.collapsible&&t.position].filter(Boolean).join(" ")}"
        aria-activedescendant="${t=>t.ariaActiveDescendant}"
        aria-controls="${t=>t.ariaControls}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-haspopup="${t=>t.collapsible?"listbox":null}"
        aria-multiselectable="${t=>t.ariaMultiSelectable}"
        ?open="${t=>t.open}"
        role="combobox"
        tabindex="${t=>t.disabled?null:"0"}"
        @click="${(t,n)=>t.clickHandler(n.event)}"
        @focusin="${(t,n)=>t.focusinHandler(n.event)}"
        @focusout="${(t,n)=>t.focusoutHandler(n.event)}"
        @keydown="${(t,n)=>t.keydownHandler(n.event)}"
        @mousedown="${(t,n)=>t.mousedownHandler(n.event)}"
    >
        ${Yi(t=>t.collapsible,S`
                <div
                    class="control"
                    part="control"
                    ?disabled="${t=>t.disabled}"
                    ${W("control")}
                >
                    ${Je(i,e)}
                    <slot name="button-container">
                        <div class="selected-value" part="selected-value">
                            <slot name="selected-value">${t=>t.displayValue}</slot>
                        </div>
                        <div aria-hidden="true" class="indicator" part="indicator">
                            <slot name="indicator">
                                ${e.indicator||""}
                            </slot>
                        </div>
                    </slot>
                    ${Ze(i,e)}
                </div>
            `)}
        <div
            class="listbox"
            id="${t=>t.listboxId}"
            part="listbox"
            role="listbox"
            ?disabled="${t=>t.disabled}"
            ?hidden="${t=>t.collapsible?!t.open:!1}"
            ${W("listbox")}
        >
            <slot
                ${ie({filter:q.slottedOptionFilter,flatten:!0,property:"slottedOptions"})}
            ></slot>
        </div>
    </template>
`,xl=(i,e)=>S`
    <template slot="tabpanel" role="tabpanel">
        <slot></slot>
    </template>
`;class _l extends R{}const wl=(i,e)=>S`
    <template slot="tab" role="tab" aria-disabled="${t=>t.disabled}">
        <slot></slot>
    </template>
`;class uo extends R{}h([p({mode:"boolean"})],uo.prototype,"disabled",void 0);const $l=(i,e)=>S`
    <template class="${t=>t.orientation}">
        ${Je(i,e)}
        <div class="tablist" part="tablist" role="tablist">
            <slot class="tab" name="tab" part="tab" ${ie("tabs")}></slot>

            ${Yi(t=>t.showActiveIndicator,S`
                    <div
                        ${W("activeIndicatorRef")}
                        class="activeIndicator"
                        part="activeIndicator"
                    ></div>
                `)}
        </div>
        ${Ze(i,e)}
        <div class="tabpanel" part="tabpanel">
            <slot name="tabpanel" ${ie("tabpanels")}></slot>
        </div>
    </template>
`,Bi={vertical:"vertical",horizontal:"horizontal"};class ye extends R{constructor(){super(...arguments),this.orientation=Bi.horizontal,this.activeindicator=!0,this.showActiveIndicator=!0,this.prevActiveTabIndex=0,this.activeTabIndex=0,this.ticking=!1,this.change=()=>{this.$emit("change",this.activetab)},this.isDisabledElement=e=>e.getAttribute("aria-disabled")==="true",this.isHiddenElement=e=>e.hasAttribute("hidden"),this.isFocusableElement=e=>!this.isDisabledElement(e)&&!this.isHiddenElement(e),this.setTabs=()=>{const e="gridColumn",t="gridRow",n=this.isHorizontal()?e:t;this.activeTabIndex=this.getActiveIndex(),this.showActiveIndicator=!1,this.tabs.forEach((s,o)=>{if(s.slot==="tab"){const r=this.activeTabIndex===o&&this.isFocusableElement(s);this.activeindicator&&this.isFocusableElement(s)&&(this.showActiveIndicator=!0);const a=this.tabIds[o],l=this.tabpanelIds[o];s.setAttribute("id",a),s.setAttribute("aria-selected",r?"true":"false"),s.setAttribute("aria-controls",l),s.addEventListener("click",this.handleTabClick),s.addEventListener("keydown",this.handleTabKeyDown),s.setAttribute("tabindex",r?"0":"-1"),r&&(this.activetab=s,this.activeid=a)}s.style[e]="",s.style[t]="",s.style[n]=`${o+1}`,this.isHorizontal()?s.classList.remove("vertical"):s.classList.add("vertical")})},this.setTabPanels=()=>{this.tabpanels.forEach((e,t)=>{const n=this.tabIds[t],s=this.tabpanelIds[t];e.setAttribute("id",s),e.setAttribute("aria-labelledby",n),this.activeTabIndex!==t?e.setAttribute("hidden",""):e.removeAttribute("hidden")})},this.handleTabClick=e=>{const t=e.currentTarget;t.nodeType===1&&this.isFocusableElement(t)&&(this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=this.tabs.indexOf(t),this.setComponent())},this.handleTabKeyDown=e=>{if(this.isHorizontal())switch(e.key){case yt:e.preventDefault(),this.adjustBackward(e);break;case xt:e.preventDefault(),this.adjustForward(e);break}else switch(e.key){case Pe:e.preventDefault(),this.adjustBackward(e);break;case De:e.preventDefault(),this.adjustForward(e);break}switch(e.key){case Ke:e.preventDefault(),this.adjust(-this.activeTabIndex);break;case et:e.preventDefault(),this.adjust(this.tabs.length-this.activeTabIndex-1);break}},this.adjustForward=e=>{const t=this.tabs;let n=0;for(n=this.activetab?t.indexOf(this.activetab)+1:1,n===t.length&&(n=0);n<t.length&&t.length>1;)if(this.isFocusableElement(t[n])){this.moveToTabByIndex(t,n);break}else{if(this.activetab&&n===t.indexOf(this.activetab))break;n+1>=t.length?n=0:n+=1}},this.adjustBackward=e=>{const t=this.tabs;let n=0;for(n=this.activetab?t.indexOf(this.activetab)-1:0,n=n<0?t.length-1:n;n>=0&&t.length>1;)if(this.isFocusableElement(t[n])){this.moveToTabByIndex(t,n);break}else n-1<0?n=t.length-1:n-=1},this.moveToTabByIndex=(e,t)=>{const n=e[t];this.activetab=n,this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=t,n.focus(),this.setComponent()}}orientationChanged(){this.$fastController.isConnected&&(this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}activeidChanged(e,t){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.prevActiveTabIndex=this.tabs.findIndex(n=>n.id===e),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabsChanged(){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabpanelsChanged(){this.$fastController.isConnected&&this.tabpanels.length<=this.tabs.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}getActiveIndex(){return this.activeid!==void 0?this.tabIds.indexOf(this.activeid)===-1?0:this.tabIds.indexOf(this.activeid):0}getTabIds(){return this.tabs.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`tab-${Qt()}`})}getTabPanelIds(){return this.tabpanels.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`panel-${Qt()}`})}setComponent(){this.activeTabIndex!==this.prevActiveTabIndex&&(this.activeid=this.tabIds[this.activeTabIndex],this.focusTab(),this.change())}isHorizontal(){return this.orientation===Bi.horizontal}handleActiveIndicatorPosition(){this.showActiveIndicator&&this.activeindicator&&this.activeTabIndex!==this.prevActiveTabIndex&&(this.ticking?this.ticking=!1:(this.ticking=!0,this.animateActiveIndicator()))}animateActiveIndicator(){this.ticking=!0;const e=this.isHorizontal()?"gridColumn":"gridRow",t=this.isHorizontal()?"translateX":"translateY",n=this.isHorizontal()?"offsetLeft":"offsetTop",s=this.activeIndicatorRef[n];this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`;const o=this.activeIndicatorRef[n];this.activeIndicatorRef.style[e]=`${this.prevActiveTabIndex+1}`;const r=o-s;this.activeIndicatorRef.style.transform=`${t}(${r}px)`,this.activeIndicatorRef.classList.add("activeIndicatorTransition"),this.activeIndicatorRef.addEventListener("transitionend",()=>{this.ticking=!1,this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`,this.activeIndicatorRef.style.transform=`${t}(0px)`,this.activeIndicatorRef.classList.remove("activeIndicatorTransition")})}adjust(e){const t=this.tabs.filter(r=>this.isFocusableElement(r)),n=t.indexOf(this.activetab),s=Sa(0,t.length-1,n+e),o=this.tabs.indexOf(t[s]);o>-1&&this.moveToTabByIndex(this.tabs,o)}focusTab(){this.tabs[this.activeTabIndex].focus()}connectedCallback(){super.connectedCallback(),this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.activeTabIndex=this.getActiveIndex()}}h([p],ye.prototype,"orientation",void 0);h([p],ye.prototype,"activeid",void 0);h([g],ye.prototype,"tabs",void 0);h([g],ye.prototype,"tabpanels",void 0);h([p({mode:"boolean"})],ye.prototype,"activeindicator",void 0);h([g],ye.prototype,"activeIndicatorRef",void 0);h([g],ye.prototype,"showActiveIndicator",void 0);J(ye,Ye);class Cl extends R{}class kl extends Tt(Cl){constructor(){super(...arguments),this.proxy=document.createElement("textarea")}}const po={none:"none",both:"both",horizontal:"horizontal",vertical:"vertical"};let Q=class extends kl{constructor(){super(...arguments),this.resize=po.none,this.cols=20,this.handleTextInput=()=>{this.value=this.control.value}}readOnlyChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.readOnly=this.readOnly)}autofocusChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.autofocus=this.autofocus)}listChanged(){this.proxy instanceof HTMLTextAreaElement&&this.proxy.setAttribute("list",this.list)}maxlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.maxLength=this.maxlength)}minlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.minLength=this.minlength)}spellcheckChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.spellcheck=this.spellcheck)}select(){this.control.select(),this.$emit("select")}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};h([p({mode:"boolean"})],Q.prototype,"readOnly",void 0);h([p],Q.prototype,"resize",void 0);h([p({mode:"boolean"})],Q.prototype,"autofocus",void 0);h([p({attribute:"form"})],Q.prototype,"formId",void 0);h([p],Q.prototype,"list",void 0);h([p({converter:ae})],Q.prototype,"maxlength",void 0);h([p({converter:ae})],Q.prototype,"minlength",void 0);h([p],Q.prototype,"name",void 0);h([p],Q.prototype,"placeholder",void 0);h([p({converter:ae,mode:"fromView"})],Q.prototype,"cols",void 0);h([p({converter:ae,mode:"fromView"})],Q.prototype,"rows",void 0);h([p({mode:"boolean"})],Q.prototype,"spellcheck",void 0);h([g],Q.prototype,"defaultSlottedNodes",void 0);J(Q,sn);const Tl=(i,e)=>S`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
            ${t=>t.resize!==po.none?`resize-${t.resize}`:""}"
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${ie("defaultSlottedNodes")}></slot>
        </label>
        <textarea
            part="control"
            class="control"
            id="control"
            ?autofocus="${t=>t.autofocus}"
            cols="${t=>t.cols}"
            ?disabled="${t=>t.disabled}"
            form="${t=>t.form}"
            list="${t=>t.list}"
            maxlength="${t=>t.maxlength}"
            minlength="${t=>t.minlength}"
            name="${t=>t.name}"
            placeholder="${t=>t.placeholder}"
            ?readonly="${t=>t.readOnly}"
            ?required="${t=>t.required}"
            rows="${t=>t.rows}"
            ?spellcheck="${t=>t.spellcheck}"
            :value="${t=>t.value}"
            aria-atomic="${t=>t.ariaAtomic}"
            aria-busy="${t=>t.ariaBusy}"
            aria-controls="${t=>t.ariaControls}"
            aria-current="${t=>t.ariaCurrent}"
            aria-describedby="${t=>t.ariaDescribedby}"
            aria-details="${t=>t.ariaDetails}"
            aria-disabled="${t=>t.ariaDisabled}"
            aria-errormessage="${t=>t.ariaErrormessage}"
            aria-flowto="${t=>t.ariaFlowto}"
            aria-haspopup="${t=>t.ariaHaspopup}"
            aria-hidden="${t=>t.ariaHidden}"
            aria-invalid="${t=>t.ariaInvalid}"
            aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
            aria-label="${t=>t.ariaLabel}"
            aria-labelledby="${t=>t.ariaLabelledby}"
            aria-live="${t=>t.ariaLive}"
            aria-owns="${t=>t.ariaOwns}"
            aria-relevant="${t=>t.ariaRelevant}"
            aria-roledescription="${t=>t.ariaRoledescription}"
            @input="${(t,n)=>t.handleTextInput()}"
            @change="${t=>t.handleChange()}"
            ${W("control")}
        ></textarea>
    </template>
`,Il=(i,e)=>S`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
        "
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot
                ${ie({property:"defaultSlottedNodes",filter:ml})}
            ></slot>
        </label>
        <div class="root" part="root">
            ${Je(i,e)}
            <input
                class="control"
                part="control"
                id="control"
                @input="${t=>t.handleTextInput()}"
                @change="${t=>t.handleChange()}"
                ?autofocus="${t=>t.autofocus}"
                ?disabled="${t=>t.disabled}"
                list="${t=>t.list}"
                maxlength="${t=>t.maxlength}"
                minlength="${t=>t.minlength}"
                pattern="${t=>t.pattern}"
                placeholder="${t=>t.placeholder}"
                ?readonly="${t=>t.readOnly}"
                ?required="${t=>t.required}"
                size="${t=>t.size}"
                ?spellcheck="${t=>t.spellcheck}"
                :value="${t=>t.value}"
                type="${t=>t.type}"
                aria-atomic="${t=>t.ariaAtomic}"
                aria-busy="${t=>t.ariaBusy}"
                aria-controls="${t=>t.ariaControls}"
                aria-current="${t=>t.ariaCurrent}"
                aria-describedby="${t=>t.ariaDescribedby}"
                aria-details="${t=>t.ariaDetails}"
                aria-disabled="${t=>t.ariaDisabled}"
                aria-errormessage="${t=>t.ariaErrormessage}"
                aria-flowto="${t=>t.ariaFlowto}"
                aria-haspopup="${t=>t.ariaHaspopup}"
                aria-hidden="${t=>t.ariaHidden}"
                aria-invalid="${t=>t.ariaInvalid}"
                aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
                aria-label="${t=>t.ariaLabel}"
                aria-labelledby="${t=>t.ariaLabelledby}"
                aria-live="${t=>t.ariaLive}"
                aria-owns="${t=>t.ariaOwns}"
                aria-relevant="${t=>t.ariaRelevant}"
                aria-roledescription="${t=>t.ariaRoledescription}"
                ${W("control")}
            />
            ${Ze(i,e)}
        </div>
    </template>
`,Ce="not-allowed",Sl=":host([hidden]){display:none}";function j(i){return`${Sl}:host{display:${i}}`}const N=$a()?"focus-visible":"focus",Ol=new Set(["children","localName","ref","style","className"]),Rl=Object.freeze(Object.create(null)),Kn="_default",Ft=new Map;function El(i,e){typeof i=="function"?i(e):i.current=e}function fo(i,e){if(!e.name){const t=wt.forType(i);if(t)e.name=t.name;else throw new Error("React wrappers must wrap a FASTElement or be configured with a name.")}return e.name}function Fi(i){return i.events||(i.events={})}function es(i,e,t){return Ol.has(t)?(console.warn(`${fo(i,e)} contains property ${t} which is a React reserved property. It will be used by React and not set on the element.`),!1):!0}function Al(i,e){if(!e.keys)if(e.properties)e.keys=new Set(e.properties.concat(Object.keys(Fi(e))));else{const t=new Set(Object.keys(Fi(e))),n=w.getAccessors(i.prototype);if(n.length>0)for(const s of n)es(i,e,s.name)&&t.add(s.name);else for(const s in i.prototype)!(s in HTMLElement.prototype)&&es(i,e,s)&&t.add(s);e.keys=t}return e.keys}function Dl(i,e){let t=[];const n={register(o,...r){t.forEach(a=>a.register(o,...r)),t=[]}};function s(o,r={}){var a,l;o instanceof no&&(e?e.register(o):t.push(o),o=o.type);const d=Ft.get(o);if(d){const f=d.get((a=r.name)!==null&&a!==void 0?a:Kn);if(f)return f}class u extends i.Component{constructor(){super(...arguments),this._element=null}_updateElement(b){const y=this._element;if(y===null)return;const T=this.props,I=b||Rl,C=Fi(r);for(const _ in this._elementProps){const L=T[_],se=C[_];if(se===void 0)y[_]=L;else{const oe=I[_];if(L===oe)continue;oe!==void 0&&y.removeEventListener(se,oe),L!==void 0&&y.addEventListener(se,L)}}}componentDidMount(){this._updateElement()}componentDidUpdate(b){this._updateElement(b)}render(){const b=this.props.__forwardedRef;(this._ref===void 0||this._userRef!==b)&&(this._ref=_=>{this._element===null&&(this._element=_),b!==null&&El(b,_),this._userRef=b});const y={ref:this._ref},T=this._elementProps={},I=Al(o,r),C=this.props;for(const _ in C){const L=C[_];I.has(_)?T[_]=L:y[_==="className"?"class":_]=L}return i.createElement(fo(o,r),y)}}const c=i.forwardRef((f,b)=>i.createElement(u,Object.assign(Object.assign({},f),{__forwardedRef:b}),f==null?void 0:f.children));return Ft.has(o)||Ft.set(o,new Map),Ft.get(o).set((l=r.name)!==null&&l!==void 0?l:Kn,c),c}return{wrap:s,registry:n}}function Pl(i){return co.getOrCreate(i).withPrefix("vscode")}function Bl(i){window.addEventListener("load",()=>{new MutationObserver(()=>{ts(i)}).observe(document.body,{attributes:!0,attributeFilter:["class"]}),ts(i)})}function ts(i){const e=getComputedStyle(document.body),t=document.querySelector("body");if(t){const n=t.getAttribute("data-vscode-theme-kind");for(const[s,o]of i){let r=e.getPropertyValue(s).toString();if(n==="vscode-high-contrast")r.length===0&&o.name.includes("background")&&(r="transparent"),o.name==="button-icon-hover-background"&&(r="transparent");else if(n==="vscode-high-contrast-light"){if(r.length===0&&o.name.includes("background"))switch(o.name){case"button-primary-hover-background":r="#0F4A85";break;case"button-secondary-hover-background":r="transparent";break;case"button-icon-hover-background":r="transparent";break}}else o.name==="contrast-active-border"&&(r="transparent");o.setValueFor(t,r)}}}const is=new Map;let ns=!1;function m(i,e){const t=lo.create(i);if(e){if(e.includes("--fake-vscode-token")){const n="id"+Math.random().toString(16).slice(2);e=`${e}-${n}`}is.set(e,t)}return ns||(Bl(is),ns=!0),t}const Fl=m("background","--vscode-editor-background").withDefault("#1e1e1e"),k=m("border-width").withDefault(1),bo=m("contrast-active-border","--vscode-contrastActiveBorder").withDefault("#f38518");m("contrast-border","--vscode-contrastBorder").withDefault("#6fc3df");const It=m("corner-radius").withDefault(0),Me=m("corner-radius-round").withDefault(2),x=m("design-unit").withDefault(4),Fe=m("disabled-opacity").withDefault(.4),B=m("focus-border","--vscode-focusBorder").withDefault("#007fd4"),ne=m("font-family","--vscode-font-family").withDefault("-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol");m("font-weight","--vscode-font-weight").withDefault("400");const V=m("foreground","--vscode-foreground").withDefault("#cccccc"),jt=m("input-height").withDefault("26"),rn=m("input-min-width").withDefault("100px"),G=m("type-ramp-base-font-size","--vscode-font-size").withDefault("13px"),Z=m("type-ramp-base-line-height").withDefault("normal"),mo=m("type-ramp-minus1-font-size").withDefault("11px"),go=m("type-ramp-minus1-line-height").withDefault("16px");m("type-ramp-minus2-font-size").withDefault("9px");m("type-ramp-minus2-line-height").withDefault("16px");m("type-ramp-plus1-font-size").withDefault("16px");m("type-ramp-plus1-line-height").withDefault("24px");const Ll=m("scrollbarWidth").withDefault("10px"),Hl=m("scrollbarHeight").withDefault("10px"),Vl=m("scrollbar-slider-background","--vscode-scrollbarSlider-background").withDefault("#79797966"),Nl=m("scrollbar-slider-hover-background","--vscode-scrollbarSlider-hoverBackground").withDefault("#646464b3"),Ml=m("scrollbar-slider-active-background","--vscode-scrollbarSlider-activeBackground").withDefault("#bfbfbf66"),vo=m("badge-background","--vscode-badge-background").withDefault("#4d4d4d"),yo=m("badge-foreground","--vscode-badge-foreground").withDefault("#ffffff"),an=m("button-border","--vscode-button-border").withDefault("transparent"),ss=m("button-icon-background").withDefault("transparent"),zl=m("button-icon-corner-radius").withDefault("5px"),jl=m("button-icon-outline-offset").withDefault(0),os=m("button-icon-hover-background","--fake-vscode-token").withDefault("rgba(90, 93, 94, 0.31)"),Ul=m("button-icon-padding").withDefault("3px"),ze=m("button-primary-background","--vscode-button-background").withDefault("#0e639c"),xo=m("button-primary-foreground","--vscode-button-foreground").withDefault("#ffffff"),_o=m("button-primary-hover-background","--vscode-button-hoverBackground").withDefault("#1177bb"),$i=m("button-secondary-background","--vscode-button-secondaryBackground").withDefault("#3a3d41"),ql=m("button-secondary-foreground","--vscode-button-secondaryForeground").withDefault("#ffffff"),Wl=m("button-secondary-hover-background","--vscode-button-secondaryHoverBackground").withDefault("#45494e"),Gl=m("button-padding-horizontal").withDefault("11px"),Ql=m("button-padding-vertical").withDefault("4px"),ue=m("checkbox-background","--vscode-checkbox-background").withDefault("#3c3c3c"),Ve=m("checkbox-border","--vscode-checkbox-border").withDefault("#3c3c3c"),Xl=m("checkbox-corner-radius").withDefault(3);m("checkbox-foreground","--vscode-checkbox-foreground").withDefault("#f0f0f0");const Re=m("list-active-selection-background","--vscode-list-activeSelectionBackground").withDefault("#094771"),je=m("list-active-selection-foreground","--vscode-list-activeSelectionForeground").withDefault("#ffffff"),Yl=m("list-hover-background","--vscode-list-hoverBackground").withDefault("#2a2d2e"),Zl=m("divider-background","--vscode-settings-dropdownListBorder").withDefault("#454545"),Lt=m("dropdown-background","--vscode-dropdown-background").withDefault("#3c3c3c"),_e=m("dropdown-border","--vscode-dropdown-border").withDefault("#3c3c3c");m("dropdown-foreground","--vscode-dropdown-foreground").withDefault("#f0f0f0");const Jl=m("dropdown-list-max-height").withDefault("200px"),Ee=m("input-background","--vscode-input-background").withDefault("#3c3c3c"),wo=m("input-foreground","--vscode-input-foreground").withDefault("#cccccc");m("input-placeholder-foreground","--vscode-input-placeholderForeground").withDefault("#cccccc");const rs=m("link-active-foreground","--vscode-textLink-activeForeground").withDefault("#3794ff"),Kl=m("link-foreground","--vscode-textLink-foreground").withDefault("#3794ff"),ec=m("progress-background","--vscode-progressBar-background").withDefault("#0e70c0"),tc=m("panel-tab-active-border","--vscode-panelTitle-activeBorder").withDefault("#e7e7e7"),Le=m("panel-tab-active-foreground","--vscode-panelTitle-activeForeground").withDefault("#e7e7e7"),ic=m("panel-tab-foreground","--vscode-panelTitle-inactiveForeground").withDefault("#e7e7e799");m("panel-view-background","--vscode-panel-background").withDefault("#1e1e1e");m("panel-view-border","--vscode-panel-border").withDefault("#80808059");const nc=m("tag-corner-radius").withDefault("2px"),sc=(i,e)=>D`
	${j("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${ne};
		font-size: ${mo};
		line-height: ${go};
		text-align: center;
	}
	.control {
		align-items: center;
		background-color: ${vo};
		border: calc(${k} * 1px) solid ${an};
		border-radius: 11px;
		box-sizing: border-box;
		color: ${yo};
		display: flex;
		height: calc(${x} * 4px);
		justify-content: center;
		min-width: calc(${x} * 4px + 2px);
		min-height: calc(${x} * 4px + 2px);
		padding: 3px 6px;
	}
`;class oc extends kt{connectedCallback(){super.connectedCallback(),this.circular||(this.circular=!0)}}const rc=oc.compose({baseName:"badge",template:so,styles:sc});function ac(i,e,t,n){var s=arguments.length,o=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(i,e,t,n);else for(var a=i.length-1;a>=0;a--)(r=i[a])&&(o=(s<3?r(o):s>3?r(e,t,o):r(e,t))||o);return s>3&&o&&Object.defineProperty(e,t,o),o}const lc=D`
	${j("inline-flex")} :host {
		outline: none;
		font-family: ${ne};
		font-size: ${G};
		line-height: ${Z};
		color: ${xo};
		background: ${ze};
		border-radius: calc(${Me} * 1px);
		fill: currentColor;
		cursor: pointer;
	}
	.control {
		background: transparent;
		height: inherit;
		flex-grow: 1;
		box-sizing: border-box;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: ${Ql} ${Gl};
		white-space: wrap;
		outline: none;
		text-decoration: none;
		border: calc(${k} * 1px) solid ${an};
		color: inherit;
		border-radius: inherit;
		fill: inherit;
		cursor: inherit;
		font-family: inherit;
	}
	:host(:hover) {
		background: ${_o};
	}
	:host(:active) {
		background: ${ze};
	}
	.control:${N} {
		outline: calc(${k} * 1px) solid ${B};
		outline-offset: calc(${k} * 2px);
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host([disabled]) {
		opacity: ${Fe};
		background: ${ze};
		cursor: ${Ce};
	}
	.content {
		display: flex;
	}
	.start {
		display: flex;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${x} * 4px);
		height: calc(${x} * 4px);
	}
	.start {
		margin-inline-end: 8px;
	}
`,cc=D`
	:host([appearance='primary']) {
		background: ${ze};
		color: ${xo};
	}
	:host([appearance='primary']:hover) {
		background: ${_o};
	}
	:host([appearance='primary']:active) .control:active {
		background: ${ze};
	}
	:host([appearance='primary']) .control:${N} {
		outline: calc(${k} * 1px) solid ${B};
		outline-offset: calc(${k} * 2px);
	}
	:host([appearance='primary'][disabled]) {
		background: ${ze};
	}
`,dc=D`
	:host([appearance='secondary']) {
		background: ${$i};
		color: ${ql};
	}
	:host([appearance='secondary']:hover) {
		background: ${Wl};
	}
	:host([appearance='secondary']:active) .control:active {
		background: ${$i};
	}
	:host([appearance='secondary']) .control:${N} {
		outline: calc(${k} * 1px) solid ${B};
		outline-offset: calc(${k} * 2px);
	}
	:host([appearance='secondary'][disabled]) {
		background: ${$i};
	}
`,hc=D`
	:host([appearance='icon']) {
		background: ${ss};
		border-radius: ${zl};
		color: ${V};
	}
	:host([appearance='icon']:hover) {
		background: ${os};
		outline: 1px dotted ${bo};
		outline-offset: -1px;
	}
	:host([appearance='icon']) .control {
		padding: ${Ul};
		border: none;
	}
	:host([appearance='icon']:active) .control:active {
		background: ${os};
	}
	:host([appearance='icon']) .control:${N} {
		outline: calc(${k} * 1px) solid ${B};
		outline-offset: ${jl};
	}
	:host([appearance='icon'][disabled]) {
		background: ${ss};
	}
`,uc=(i,e)=>D`
	${lc}
	${cc}
	${dc}
	${hc}
`;class $o extends ce{connectedCallback(){if(super.connectedCallback(),!this.appearance){const e=this.getAttribute("appearance");this.appearance=e}}attributeChangedCallback(e,t,n){e==="appearance"&&n==="icon"&&(this.getAttribute("aria-label")||(this.ariaLabel="Icon Button")),e==="aria-label"&&(this.ariaLabel=n),e==="disabled"&&(this.disabled=n!==null)}}ac([p],$o.prototype,"appearance",void 0);const pc=$o.compose({baseName:"button",template:Aa,styles:uc,shadowOptions:{delegatesFocus:!0}}),fc=(i,e)=>D`
	${j("inline-flex")} :host {
		align-items: center;
		outline: none;
		margin: calc(${x} * 1px) 0;
		user-select: none;
		font-size: ${G};
		line-height: ${Z};
	}
	.control {
		position: relative;
		width: calc(${x} * 4px + 2px);
		height: calc(${x} * 4px + 2px);
		box-sizing: border-box;
		border-radius: calc(${Xl} * 1px);
		border: calc(${k} * 1px) solid ${Ve};
		background: ${ue};
		outline: none;
		cursor: pointer;
	}
	.label {
		font-family: ${ne};
		color: ${V};
		padding-inline-start: calc(${x} * 2px + 2px);
		margin-inline-end: calc(${x} * 2px + 2px);
		cursor: pointer;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.checked-indicator {
		width: 100%;
		height: 100%;
		display: block;
		fill: ${V};
		opacity: 0;
		pointer-events: none;
	}
	.indeterminate-indicator {
		border-radius: 2px;
		background: ${V};
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	:host(:enabled) .control:hover {
		background: ${ue};
		border-color: ${Ve};
	}
	:host(:enabled) .control:active {
		background: ${ue};
		border-color: ${B};
	}
	:host(:${N}) .control {
		border: calc(${k} * 1px) solid ${B};
	}
	:host(.disabled) .label,
	:host(.readonly) .label,
	:host(.readonly) .control,
	:host(.disabled) .control {
		cursor: ${Ce};
	}
	:host(.checked:not(.indeterminate)) .checked-indicator,
	:host(.indeterminate) .indeterminate-indicator {
		opacity: 1;
	}
	:host(.disabled) {
		opacity: ${Fe};
	}
`;class bc extends ni{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Checkbox")}}const mc=bc.compose({baseName:"checkbox",template:ja,styles:fc,checkedIndicator:`
		<svg 
			part="checked-indicator"
			class="checked-indicator"
			width="16" 
			height="16" 
			viewBox="0 0 16 16" 
			xmlns="http://www.w3.org/2000/svg" 
			fill="currentColor"
		>
			<path 
				fill-rule="evenodd" 
				clip-rule="evenodd" 
				d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"
			/>
		</svg>
	`,indeterminateIndicator:`
		<div part="indeterminate-indicator" class="indeterminate-indicator"></div>
	`}),gc=(i,e)=>D`
	:host {
		display: flex;
		position: relative;
		flex-direction: column;
		width: 100%;
	}
`,vc=(i,e)=>D`
	:host {
		display: grid;
		padding: calc((${x} / 4) * 1px) 0;
		box-sizing: border-box;
		width: 100%;
		background: transparent;
	}
	:host(.header) {
	}
	:host(.sticky-header) {
		background: ${Fl};
		position: sticky;
		top: 0;
	}
	:host(:hover) {
		background: ${Yl};
		outline: 1px dotted ${bo};
		outline-offset: -1px;
	}
`,yc=(i,e)=>D`
	:host {
		padding: calc(${x} * 1px) calc(${x} * 3px);
		color: ${V};
		opacity: 1;
		box-sizing: border-box;
		font-family: ${ne};
		font-size: ${G};
		line-height: ${Z};
		font-weight: 400;
		border: solid calc(${k} * 1px) transparent;
		border-radius: calc(${It} * 1px);
		white-space: wrap;
		overflow-wrap: anywhere;
	}
	:host(.column-header) {
		font-weight: 600;
	}
	:host(:${N}),
	:host(:focus),
	:host(:active) {
		background: ${Re};
		border: solid calc(${k} * 1px) ${B};
		color: ${je};
		outline: none;
	}
	:host(:${N}) ::slotted(*),
	:host(:focus) ::slotted(*),
	:host(:active) ::slotted(*) {
		color: ${je} !important;
	}
`;class xc extends z{connectedCallback(){super.connectedCallback(),this.getAttribute("aria-label")||this.setAttribute("aria-label","Data Grid")}}const _c=xc.compose({baseName:"data-grid",baseClass:z,template:Fa,styles:gc});class wc extends M{}const $c=wc.compose({baseName:"data-grid-row",baseClass:M,template:Ma,styles:vc});class Cc extends ke{}const kc=Cc.compose({baseName:"data-grid-cell",baseClass:ke,template:za,styles:yc}),Tc=(i,e)=>D`
	${j("block")} :host {
		border: none;
		border-top: calc(${k} * 1px) solid ${Zl};
		box-sizing: content-box;
		height: 0;
		margin: calc(${x} * 1px) 0;
		width: 100%;
	}
`;class Ic extends nn{}const Sc=Ic.compose({baseName:"divider",template:ol,styles:Tc}),Oc=(i,e)=>D`
	${j("inline-flex")} :host {
		background: ${Lt};
		border-radius: calc(${Me} * 1px);
		box-sizing: border-box;
		color: ${V};
		contain: contents;
		font-family: ${ne};
		height: calc(${jt} * 1px);
		position: relative;
		user-select: none;
		min-width: ${rn};
		outline: none;
		vertical-align: top;
	}
	.control {
		align-items: center;
		box-sizing: border-box;
		border: calc(${k} * 1px) solid ${_e};
		border-radius: calc(${Me} * 1px);
		cursor: pointer;
		display: flex;
		font-family: inherit;
		font-size: ${G};
		line-height: ${Z};
		min-height: 100%;
		padding: 2px 6px 2px 8px;
		width: 100%;
	}
	.listbox {
		background: ${Lt};
		border: calc(${k} * 1px) solid ${B};
		border-radius: calc(${Me} * 1px);
		box-sizing: border-box;
		display: inline-flex;
		flex-direction: column;
		left: 0;
		max-height: ${Jl};
		padding: 0;
		overflow-y: auto;
		position: absolute;
		width: 100%;
		z-index: 1;
	}
	.listbox[hidden] {
		display: none;
	}
	:host(:${N}) .control {
		border-color: ${B};
	}
	:host(:not([disabled]):hover) {
		background: ${Lt};
		border-color: ${_e};
	}
	:host(:${N}) ::slotted([aria-selected="true"][role="option"]:not([disabled])) {
		background: ${Re};
		border: calc(${k} * 1px) solid transparent;
		color: ${je};
	}
	:host([disabled]) {
		cursor: ${Ce};
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		cursor: ${Ce};
		user-select: none;
	}
	:host([disabled]:hover) {
		background: ${Lt};
		color: ${V};
		fill: currentcolor;
	}
	:host(:not([disabled])) .control:active {
		border-color: ${B};
	}
	:host(:empty) .listbox {
		display: none;
	}
	:host([open]) .control {
		border-color: ${B};
	}
	:host([open][position='above']) .listbox {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	:host([open][position='below']) .listbox {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
	:host([open][position='above']) .listbox {
		bottom: calc(${jt} * 1px);
	}
	:host([open][position='below']) .listbox {
		top: calc(${jt} * 1px);
	}
	.selected-value {
		flex: 1 1 auto;
		font-family: inherit;
		overflow: hidden;
		text-align: start;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.indicator {
		flex: 0 0 auto;
		margin-inline-start: 1em;
	}
	slot[name='listbox'] {
		display: none;
		width: 100%;
	}
	:host([open]) slot[name='listbox'] {
		display: flex;
		position: absolute;
	}
	.end {
		margin-inline-start: auto;
	}
	.start,
	.end,
	.indicator,
	.select-indicator,
	::slotted(svg),
	::slotted(span) {
		fill: currentcolor;
		height: 1em;
		min-height: calc(${x} * 4px);
		min-width: calc(${x} * 4px);
		width: 1em;
	}
	::slotted([role='option']),
	::slotted(option) {
		flex: 0 0 auto;
	}
`;class Rc extends Ie{}const Ec=Rc.compose({baseName:"dropdown",template:yl,styles:Oc,indicator:`
		<svg 
			class="select-indicator"
			part="select-indicator"
			width="16" 
			height="16" 
			viewBox="0 0 16 16" 
			xmlns="http://www.w3.org/2000/svg" 
			fill="currentColor"
		>
			<path 
				fill-rule="evenodd" 
				clip-rule="evenodd" 
				d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"
			/>
		</svg>
	`}),Ac=(i,e)=>D`
	${j("inline-flex")} :host {
		background: transparent;
		box-sizing: border-box;
		color: ${Kl};
		cursor: pointer;
		fill: currentcolor;
		font-family: ${ne};
		font-size: ${G};
		line-height: ${Z};
		outline: none;
	}
	.control {
		background: transparent;
		border: calc(${k} * 1px) solid transparent;
		border-radius: calc(${It} * 1px);
		box-sizing: border-box;
		color: inherit;
		cursor: inherit;
		fill: inherit;
		font-family: inherit;
		height: inherit;
		padding: 0;
		outline: none;
		text-decoration: none;
		word-break: break-word;
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host(:hover) {
		color: ${rs};
	}
	:host(:hover) .content {
		text-decoration: underline;
	}
	:host(:active) {
		background: transparent;
		color: ${rs};
	}
	:host(:${N}) .control,
	:host(:focus) .control {
		border: calc(${k} * 1px) solid ${B};
	}
`;class Dc extends le{}const Pc=Dc.compose({baseName:"link",template:Ra,styles:Ac,shadowOptions:{delegatesFocus:!0}}),Bc=(i,e)=>D`
	${j("inline-flex")} :host {
		font-family: var(--body-font);
		border-radius: ${It};
		border: calc(${k} * 1px) solid transparent;
		box-sizing: border-box;
		color: ${V};
		cursor: pointer;
		fill: currentcolor;
		font-size: ${G};
		line-height: ${Z};
		margin: 0;
		outline: none;
		overflow: hidden;
		padding: 0 calc((${x} / 2) * 1px)
			calc((${x} / 4) * 1px);
		user-select: none;
		white-space: nowrap;
	}
	:host(:${N}) {
		border-color: ${B};
		background: ${Re};
		color: ${V};
	}
	:host([aria-selected='true']) {
		background: ${Re};
		border: calc(${k} * 1px) solid transparent;
		color: ${je};
	}
	:host(:active) {
		background: ${Re};
		color: ${je};
	}
	:host(:not([aria-selected='true']):hover) {
		background: ${Re};
		border: calc(${k} * 1px) solid transparent;
		color: ${je};
	}
	:host(:not([aria-selected='true']):active) {
		background: ${Re};
		color: ${V};
	}
	:host([disabled]) {
		cursor: ${Ce};
		opacity: ${Fe};
	}
	:host([disabled]:hover) {
		background-color: inherit;
	}
	.content {
		grid-column-start: 2;
		justify-self: start;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;let Fc=class extends ve{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Option")}};const Lc=Fc.compose({baseName:"option",template:al,styles:Bc}),Hc=(i,e)=>D`
	${j("grid")} :host {
		box-sizing: border-box;
		font-family: ${ne};
		font-size: ${G};
		line-height: ${Z};
		color: ${V};
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr;
		overflow-x: auto;
	}
	.tablist {
		display: grid;
		grid-template-rows: auto auto;
		grid-template-columns: auto;
		column-gap: calc(${x} * 8px);
		position: relative;
		width: max-content;
		align-self: end;
		padding: calc(${x} * 1px) calc(${x} * 1px) 0;
		box-sizing: border-box;
	}
	.start,
	.end {
		align-self: center;
	}
	.activeIndicator {
		grid-row: 2;
		grid-column: 1;
		width: 100%;
		height: calc((${x} / 4) * 1px);
		justify-self: center;
		background: ${Le};
		margin: 0;
		border-radius: calc(${It} * 1px);
	}
	.activeIndicatorTransition {
		transition: transform 0.01s linear;
	}
	.tabpanel {
		grid-row: 2;
		grid-column-start: 1;
		grid-column-end: 4;
		position: relative;
	}
`,Vc=(i,e)=>D`
	${j("inline-flex")} :host {
		box-sizing: border-box;
		font-family: ${ne};
		font-size: ${G};
		line-height: ${Z};
		height: calc(${x} * 7px);
		padding: calc(${x} * 1px) 0;
		color: ${ic};
		fill: currentcolor;
		border-radius: calc(${It} * 1px);
		border: solid calc(${k} * 1px) transparent;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		cursor: pointer;
	}
	:host(:hover) {
		color: ${Le};
		fill: currentcolor;
	}
	:host(:active) {
		color: ${Le};
		fill: currentcolor;
	}
	:host([aria-selected='true']) {
		background: transparent;
		color: ${Le};
		fill: currentcolor;
	}
	:host([aria-selected='true']:hover) {
		background: transparent;
		color: ${Le};
		fill: currentcolor;
	}
	:host([aria-selected='true']:active) {
		background: transparent;
		color: ${Le};
		fill: currentcolor;
	}
	:host(:${N}) {
		outline: none;
		border: solid calc(${k} * 1px) ${tc};
	}
	:host(:focus) {
		outline: none;
	}
	::slotted(vscode-badge) {
		margin-inline-start: calc(${x} * 2px);
	}
`,Nc=(i,e)=>D`
	${j("flex")} :host {
		color: inherit;
		background-color: transparent;
		border: solid calc(${k} * 1px) transparent;
		box-sizing: border-box;
		font-size: ${G};
		line-height: ${Z};
		padding: 10px calc((${x} + 2) * 1px);
	}
`;class Mc extends ye{connectedCallback(){super.connectedCallback(),this.orientation&&(this.orientation=Bi.horizontal),this.getAttribute("aria-label")||this.setAttribute("aria-label","Panels")}}const zc=Mc.compose({baseName:"panels",template:$l,styles:Hc});class jc extends uo{connectedCallback(){super.connectedCallback(),this.disabled&&(this.disabled=!1),this.textContent&&this.setAttribute("aria-label",this.textContent)}}const Uc=jc.compose({baseName:"panel-tab",template:wl,styles:Vc});class qc extends _l{}const Wc=qc.compose({baseName:"panel-view",template:xl,styles:Nc}),Gc=(i,e)=>D`
	${j("flex")} :host {
		align-items: center;
		outline: none;
		height: calc(${x} * 7px);
		width: calc(${x} * 7px);
		margin: 0;
	}
	.progress {
		height: 100%;
		width: 100%;
	}
	.background {
		fill: none;
		stroke: transparent;
		stroke-width: calc(${x} / 2 * 1px);
	}
	.indeterminate-indicator-1 {
		fill: none;
		stroke: ${ec};
		stroke-width: calc(${x} / 2 * 1px);
		stroke-linecap: square;
		transform-origin: 50% 50%;
		transform: rotate(-90deg);
		transition: all 0.2s ease-in-out;
		animation: spin-infinite 2s linear infinite;
	}
	@keyframes spin-infinite {
		0% {
			stroke-dasharray: 0.01px 43.97px;
			transform: rotate(0deg);
		}
		50% {
			stroke-dasharray: 21.99px 21.99px;
			transform: rotate(450deg);
		}
		100% {
			stroke-dasharray: 0.01px 43.97px;
			transform: rotate(1080deg);
		}
	}
`;class Qc extends it{connectedCallback(){super.connectedCallback(),this.paused&&(this.paused=!1),this.setAttribute("aria-label","Loading"),this.setAttribute("aria-live","assertive"),this.setAttribute("role","alert")}attributeChangedCallback(e,t,n){e==="value"&&this.removeAttribute("value")}}const Xc=Qc.compose({baseName:"progress-ring",template:hl,styles:Gc,indeterminateIndicator:`
		<svg class="progress" part="progress" viewBox="0 0 16 16">
			<circle
				class="background"
				part="background"
				cx="8px"
				cy="8px"
				r="7px"
			></circle>
			<circle
				class="indeterminate-indicator-1"
				part="indeterminate-indicator-1"
				cx="8px"
				cy="8px"
				r="7px"
			></circle>
		</svg>
	`}),Yc=(i,e)=>D`
	${j("flex")} :host {
		align-items: flex-start;
		margin: calc(${x} * 1px) 0;
		flex-direction: column;
	}
	.positioning-region {
		display: flex;
		flex-wrap: wrap;
	}
	:host([orientation='vertical']) .positioning-region {
		flex-direction: column;
	}
	:host([orientation='horizontal']) .positioning-region {
		flex-direction: row;
	}
	::slotted([slot='label']) {
		color: ${V};
		font-size: ${G};
		margin: calc(${x} * 1px) 0;
	}
`;class Zc extends Te{connectedCallback(){super.connectedCallback();const e=this.querySelector("label");if(e){const t="radio-group-"+Math.random().toString(16).slice(2);e.setAttribute("id",t),this.setAttribute("aria-labelledby",t)}}}const Jc=Zc.compose({baseName:"radio-group",template:ul,styles:Yc}),Kc=(i,e)=>D`
	${j("inline-flex")} :host {
		align-items: center;
		flex-direction: row;
		font-size: ${G};
		line-height: ${Z};
		margin: calc(${x} * 1px) 0;
		outline: none;
		position: relative;
		transition: all 0.2s ease-in-out;
		user-select: none;
	}
	.control {
		background: ${ue};
		border-radius: 999px;
		border: calc(${k} * 1px) solid ${Ve};
		box-sizing: border-box;
		cursor: pointer;
		height: calc(${x} * 4px);
		position: relative;
		outline: none;
		width: calc(${x} * 4px);
	}
	.label {
		color: ${V};
		cursor: pointer;
		font-family: ${ne};
		margin-inline-end: calc(${x} * 2px + 2px);
		padding-inline-start: calc(${x} * 2px + 2px);
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.control,
	.checked-indicator {
		flex-shrink: 0;
	}
	.checked-indicator {
		background: ${V};
		border-radius: 999px;
		display: inline-block;
		inset: calc(${x} * 1px);
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}
	:host(:not([disabled])) .control:hover {
		background: ${ue};
		border-color: ${Ve};
	}
	:host(:not([disabled])) .control:active {
		background: ${ue};
		border-color: ${B};
	}
	:host(:${N}) .control {
		border: calc(${k} * 1px) solid ${B};
	}
	:host([aria-checked='true']) .control {
		background: ${ue};
		border: calc(${k} * 1px) solid ${Ve};
	}
	:host([aria-checked='true']:not([disabled])) .control:hover {
		background: ${ue};
		border: calc(${k} * 1px) solid ${Ve};
	}
	:host([aria-checked='true']:not([disabled])) .control:active {
		background: ${ue};
		border: calc(${k} * 1px) solid ${B};
	}
	:host([aria-checked="true"]:${N}:not([disabled])) .control {
		border: calc(${k} * 1px) solid ${B};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Ce};
	}
	:host([aria-checked='true']) .checked-indicator {
		opacity: 1;
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
`;class ed extends oi{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Radio")}}const td=ed.compose({baseName:"radio",template:pl,styles:Kc,checkedIndicator:`
		<div part="checked-indicator" class="checked-indicator"></div>
	`}),id=(i,e)=>D`
	${j("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${ne};
		font-size: ${mo};
		line-height: ${go};
	}
	.control {
		background-color: ${vo};
		border: calc(${k} * 1px) solid ${an};
		border-radius: ${nc};
		color: ${yo};
		padding: calc(${x} * 0.5px) calc(${x} * 1px);
		text-transform: uppercase;
	}
`;class nd extends kt{connectedCallback(){super.connectedCallback(),this.circular&&(this.circular=!1)}}const sd=nd.compose({baseName:"tag",template:so,styles:id}),od=(i,e)=>D`
	${j("inline-block")} :host {
		font-family: ${ne};
		outline: none;
		user-select: none;
	}
	.control {
		box-sizing: border-box;
		position: relative;
		color: ${wo};
		background: ${Ee};
		border-radius: calc(${Me} * 1px);
		border: calc(${k} * 1px) solid ${_e};
		font: inherit;
		font-size: ${G};
		line-height: ${Z};
		padding: calc(${x} * 2px + 1px);
		width: 100%;
		min-width: ${rn};
		resize: none;
	}
	.control:hover:enabled {
		background: ${Ee};
		border-color: ${_e};
	}
	.control:active:enabled {
		background: ${Ee};
		border-color: ${B};
	}
	.control:hover,
	.control:${N},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.control::-webkit-scrollbar {
		width: ${Ll};
		height: ${Hl};
	}
	.control::-webkit-scrollbar-corner {
		background: ${Ee};
	}
	.control::-webkit-scrollbar-thumb {
		background: ${Vl};
	}
	.control::-webkit-scrollbar-thumb:hover {
		background: ${Nl};
	}
	.control::-webkit-scrollbar-thumb:active {
		background: ${Ml};
	}
	:host(:focus-within:not([disabled])) .control {
		border-color: ${B};
	}
	:host([resize='both']) .control {
		resize: both;
	}
	:host([resize='horizontal']) .control {
		resize: horizontal;
	}
	:host([resize='vertical']) .control {
		resize: vertical;
	}
	.label {
		display: block;
		color: ${V};
		cursor: pointer;
		font-size: ${G};
		line-height: ${Z};
		margin-bottom: 2px;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Ce};
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		border-color: ${_e};
	}
`;class rd extends Q{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text area")}}const ad=rd.compose({baseName:"text-area",template:Tl,styles:od,shadowOptions:{delegatesFocus:!0}}),ld=(i,e)=>D`
	${j("inline-block")} :host {
		font-family: ${ne};
		outline: none;
		user-select: none;
	}
	.root {
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		color: ${wo};
		background: ${Ee};
		border-radius: calc(${Me} * 1px);
		border: calc(${k} * 1px) solid ${_e};
		height: calc(${jt} * 1px);
		min-width: ${rn};
	}
	.control {
		-webkit-appearance: none;
		font: inherit;
		background: transparent;
		border: 0;
		color: inherit;
		height: calc(100% - (${x} * 1px));
		width: 100%;
		margin-top: auto;
		margin-bottom: auto;
		border: none;
		padding: 0 calc(${x} * 2px + 1px);
		font-size: ${G};
		line-height: ${Z};
	}
	.control:hover,
	.control:${N},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.label {
		display: block;
		color: ${V};
		cursor: pointer;
		font-size: ${G};
		line-height: ${Z};
		margin-bottom: 2px;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.start,
	.end {
		display: flex;
		margin: auto;
		fill: currentcolor;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${x} * 4px);
		height: calc(${x} * 4px);
	}
	.start {
		margin-inline-start: calc(${x} * 2px);
	}
	.end {
		margin-inline-end: calc(${x} * 2px);
	}
	:host(:hover:not([disabled])) .root {
		background: ${Ee};
		border-color: ${_e};
	}
	:host(:active:not([disabled])) .root {
		background: ${Ee};
		border-color: ${B};
	}
	:host(:focus-within:not([disabled])) .root {
		border-color: ${B};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Ce};
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		border-color: ${_e};
	}
`;class cd extends K{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text field")}}const dd=cd.compose({baseName:"text-field",template:Il,styles:ld,shadowOptions:{delegatesFocus:!0}}),{wrap:F}=Dl(Rs,Pl());F(rc(),{name:"vscode-badge"});F(pc(),{name:"vscode-button"});F(mc(),{name:"vscode-checkbox",events:{onChange:"change"}});const hd=F(_c(),{name:"vscode-data-grid"}),Xt=F(kc(),{name:"vscode-data-grid-cell"}),Co=F($c(),{name:"vscode-data-grid-row"});F(Sc(),{name:"vscode-divider"});F(Ec(),{name:"vscode-dropdown",events:{onChange:"change"}});F(Pc(),{name:"vscode-link"});F(Lc(),{name:"vscode-option"});F(zc(),{name:"vscode-panels",events:{onChange:"change"}});F(Uc(),{name:"vscode-panel-tab"});F(Wc(),{name:"vscode-panel-view"});F(Xc(),{name:"vscode-progress-ring"});F(td(),{name:"vscode-radio",events:{onChange:"change"}});F(Jc(),{name:"vscode-radio-group",events:{onChange:"change"}});F(sd(),{name:"vscode-tag"});F(ad(),{name:"vscode-text-area",events:{onChange:"change",onInput:"input"}});F(dd(),{name:"vscode-text-field",events:{onChange:"change",onInput:"input"}});const ud="_welcomeMessage_oxtox_1",as={welcomeMessage:ud},pd=X(Co,{"row-type":"sticky-header",children:[X(Xt,{"cell-type":"columnheader","grid-column":"1",children:"Message"}),X(Xt,{"cell-type":"columnheader","grid-column":"2",children:"File Path"})]}),fd=(i,e)=>X(Co,{children:[X(Xt,{"grid-column":"1",children:i.message}),X(Xt,{"grid-column":"2",children:i.path??""})]},e),bd=()=>{const[i,e]=Vi(window.errorWebviewViewProps);if(Ni(()=>{const n=s=>{s.data.kind==="webview.error.setProps"&&e(s.data.errorWebviewViewProps)};return window.addEventListener("message",n),()=>{window.removeEventListener("message",n)}},[]),i.kind!=="CASE_SELECTED")return X("main",{children:X("p",{className:as.welcomeMessage,children:i.kind==="MAIN_WEBVIEW_VIEW_NOT_VISIBLE"?"Open the left-sided Intuita View Container to see the errors.":i.kind==="CODEMOD_RUNS_TAB_NOT_ACTIVE"?"Open the Codemod Runs tab to see the errors.":"Choose a codemod run from Codemod Runs to see its errors."})});if(i.executionErrors.length===0)return X("main",{children:X("p",{className:as.welcomeMessage,children:"No execution errors found for the selected codemod run."})});const t=i.executionErrors.map(fd);return X("main",{children:X(hd,{gridTemplateColumns:"50% 50%",children:[pd,t]})})},md=xr.createRoot(document.getElementById("root"));md.render(X(Rs.StrictMode,{children:X(bd,{})}));
