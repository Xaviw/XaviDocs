import{d as it,u as ot,r as K,o as at,a as ut,b as st,c as rt,e as R,V as dt,f as ct,F as ht,_ as ft}from"./app.0541df8c.js";var Q=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},G={},lt={get exports(){return G},set exports(H){G=H}};(function(H,U){(function(g,$){H.exports=$()})(Q,function(){var g=1e3,$=6e4,T=36e5,S="millisecond",M="second",w="minute",x="hour",m="day",f="week",p="month",O="quarter",_="year",y="date",j="Invalid Date",P=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,N=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,V={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(i){var e=["th","st","nd","rd"],t=i%100;return"["+i+(e[(t-20)%10]||e[t]||e[0])+"]"}},W=function(i,e,t){var a=String(i);return!a||a.length>=e?i:""+Array(e+1-a.length).join(t)+i},I={s:W,z:function(i){var e=-i.utcOffset(),t=Math.abs(e),a=Math.floor(t/60),n=t%60;return(e<=0?"+":"-")+W(a,2,"0")+":"+W(n,2,"0")},m:function i(e,t){if(e.date()<t.date())return-i(t,e);var a=12*(t.year()-e.year())+(t.month()-e.month()),n=e.clone().add(a,p),d=t-n<0,u=e.clone().add(a+(d?-1:1),p);return+(-(a+(t-n)/(d?n-u:u-n))||0)},a:function(i){return i<0?Math.ceil(i)||0:Math.floor(i)},p:function(i){return{M:p,y:_,w:f,d:m,D:y,h:x,m:w,s:M,ms:S,Q:O}[i]||String(i||"").toLowerCase().replace(/s$/,"")},u:function(i){return i===void 0}},c="en",r={};r[c]=V;var s=function(i){return i instanceof b},l=function i(e,t,a){var n;if(!e)return c;if(typeof e=="string"){var d=e.toLowerCase();r[d]&&(n=d),t&&(r[d]=t,n=d);var u=e.split("-");if(!n&&u.length>1)return i(u[0])}else{var v=e.name;r[v]=e,n=v}return!a&&n&&(c=n),n||!a&&c},h=function(i,e){if(s(i))return i.clone();var t=typeof e=="object"?e:{};return t.date=i,t.args=arguments,new b(t)},o=I;o.l=l,o.i=s,o.w=function(i,e){return h(i,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var b=function(){function i(t){this.$L=l(t.locale,null,!0),this.parse(t)}var e=i.prototype;return e.parse=function(t){this.$d=function(a){var n=a.date,d=a.utc;if(n===null)return new Date(NaN);if(o.u(n))return new Date;if(n instanceof Date)return new Date(n);if(typeof n=="string"&&!/Z$/i.test(n)){var u=n.match(P);if(u){var v=u[2]-1||0,D=(u[7]||"0").substring(0,3);return d?new Date(Date.UTC(u[1],v,u[3]||1,u[4]||0,u[5]||0,u[6]||0,D)):new Date(u[1],v,u[3]||1,u[4]||0,u[5]||0,u[6]||0,D)}}return new Date(n)}(t),this.$x=t.x||{},this.init()},e.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},e.$utils=function(){return o},e.isValid=function(){return this.$d.toString()!==j},e.isSame=function(t,a){var n=h(t);return this.startOf(a)<=n&&n<=this.endOf(a)},e.isAfter=function(t,a){return h(t)<this.startOf(a)},e.isBefore=function(t,a){return this.endOf(a)<h(t)},e.$g=function(t,a,n){return o.u(t)?this[a]:this.set(n,t)},e.unix=function(){return Math.floor(this.valueOf()/1e3)},e.valueOf=function(){return this.$d.getTime()},e.startOf=function(t,a){var n=this,d=!!o.u(a)||a,u=o.p(t),v=function(J,C){var E=o.w(n.$u?Date.UTC(n.$y,C,J):new Date(n.$y,C,J),n);return d?E:E.endOf(m)},D=function(J,C){return o.w(n.toDate()[J].apply(n.toDate("s"),(d?[0,0,0,0]:[23,59,59,999]).slice(C)),n)},Y=this.$W,L=this.$M,z=this.$D,F="set"+(this.$u?"UTC":"");switch(u){case _:return d?v(1,0):v(31,11);case p:return d?v(1,L):v(0,L+1);case f:var B=this.$locale().weekStart||0,Z=(Y<B?Y+7:Y)-B;return v(d?z-Z:z+(6-Z),L);case m:case y:return D(F+"Hours",0);case x:return D(F+"Minutes",1);case w:return D(F+"Seconds",2);case M:return D(F+"Milliseconds",3);default:return this.clone()}},e.endOf=function(t){return this.startOf(t,!1)},e.$set=function(t,a){var n,d=o.p(t),u="set"+(this.$u?"UTC":""),v=(n={},n[m]=u+"Date",n[y]=u+"Date",n[p]=u+"Month",n[_]=u+"FullYear",n[x]=u+"Hours",n[w]=u+"Minutes",n[M]=u+"Seconds",n[S]=u+"Milliseconds",n)[d],D=d===m?this.$D+(a-this.$W):a;if(d===p||d===_){var Y=this.clone().set(y,1);Y.$d[v](D),Y.init(),this.$d=Y.set(y,Math.min(this.$D,Y.daysInMonth())).$d}else v&&this.$d[v](D);return this.init(),this},e.set=function(t,a){return this.clone().$set(t,a)},e.get=function(t){return this[o.p(t)]()},e.add=function(t,a){var n,d=this;t=Number(t);var u=o.p(a),v=function(L){var z=h(d);return o.w(z.date(z.date()+Math.round(L*t)),d)};if(u===p)return this.set(p,this.$M+t);if(u===_)return this.set(_,this.$y+t);if(u===m)return v(1);if(u===f)return v(7);var D=(n={},n[w]=$,n[x]=T,n[M]=g,n)[u]||1,Y=this.$d.getTime()+t*D;return o.w(Y,this)},e.subtract=function(t,a){return this.add(-1*t,a)},e.format=function(t){var a=this,n=this.$locale();if(!this.isValid())return n.invalidDate||j;var d=t||"YYYY-MM-DDTHH:mm:ssZ",u=o.z(this),v=this.$H,D=this.$m,Y=this.$M,L=n.weekdays,z=n.months,F=function(C,E,X,q){return C&&(C[E]||C(a,d))||X[E].slice(0,q)},B=function(C){return o.s(v%12||12,C,"0")},Z=n.meridiem||function(C,E,X){var q=C<12?"AM":"PM";return X?q.toLowerCase():q},J={YY:String(this.$y).slice(-2),YYYY:this.$y,M:Y+1,MM:o.s(Y+1,2,"0"),MMM:F(n.monthsShort,Y,z,3),MMMM:F(z,Y),D:this.$D,DD:o.s(this.$D,2,"0"),d:String(this.$W),dd:F(n.weekdaysMin,this.$W,L,2),ddd:F(n.weekdaysShort,this.$W,L,3),dddd:L[this.$W],H:String(v),HH:o.s(v,2,"0"),h:B(1),hh:B(2),a:Z(v,D,!0),A:Z(v,D,!1),m:String(D),mm:o.s(D,2,"0"),s:String(this.$s),ss:o.s(this.$s,2,"0"),SSS:o.s(this.$ms,3,"0"),Z:u};return d.replace(N,function(C,E){return E||J[C]||u.replace(":","")})},e.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},e.diff=function(t,a,n){var d,u=o.p(a),v=h(t),D=(v.utcOffset()-this.utcOffset())*$,Y=this-v,L=o.m(this,v);return L=(d={},d[_]=L/12,d[p]=L,d[O]=L/3,d[f]=(Y-D)/6048e5,d[m]=(Y-D)/864e5,d[x]=Y/T,d[w]=Y/$,d[M]=Y/g,d)[u]||Y,n?L:o.a(L)},e.daysInMonth=function(){return this.endOf(p).$D},e.$locale=function(){return r[this.$L]},e.locale=function(t,a){if(!t)return this.$L;var n=this.clone(),d=l(t,a,!0);return d&&(n.$L=d),n},e.clone=function(){return o.w(this.$d,this)},e.toDate=function(){return new Date(this.valueOf())},e.toJSON=function(){return this.isValid()?this.toISOString():null},e.toISOString=function(){return this.$d.toISOString()},e.toString=function(){return this.$d.toUTCString()},i}(),k=b.prototype;return h.prototype=k,[["$ms",S],["$s",M],["$m",w],["$H",x],["$W",m],["$M",p],["$y",_],["$D",y]].forEach(function(i){k[i[1]]=function(e){return this.$g(e,i[0],i[1])}}),h.extend=function(i,e){return i.$i||(i(e,b,h),i.$i=!0),h},h.locale=l,h.isDayjs=s,h.unix=function(i){return h(1e3*i)},h.en=r[c],h.Ls=r,h.p={},h})})(lt);const A=G;var tt={},mt={get exports(){return tt},set exports(H){tt=H}};(function(H,U){(function(g,$){H.exports=$()})(Q,function(){return function(g,$,T){g=g||{};var S=$.prototype,M={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function w(m,f,p,O){return S.fromToBase(m,f,p,O)}T.en.relativeTime=M,S.fromToBase=function(m,f,p,O,_){for(var y,j,P,N=p.$locale().relativeTime||M,V=g.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],W=V.length,I=0;I<W;I+=1){var c=V[I];c.d&&(y=O?T(m).diff(p,c.d,!0):p.diff(m,c.d,!0));var r=(g.rounding||Math.round)(Math.abs(y));if(P=y>0,r<=c.r||!c.r){r<=1&&I>0&&(c=V[I-1]);var s=N[c.l];_&&(r=_(""+r)),j=typeof s=="string"?s.replace("%d",r):s(r,f,c.l,P);break}}if(f)return j;var l=P?N.future:N.past;return typeof l=="function"?l(j):l.replace("%s",j)},S.to=function(m,f){return w(m,f,this,!0)},S.from=function(m,f){return w(m,f,this)};var x=function(m){return m.$u?T.utc():T()};S.toNow=function(m){return this.to(x(this),m)},S.fromNow=function(m){return this.from(x(this),m)}}})})(mt);const $t=tt;var nt={},pt={get exports(){return nt},set exports(H){nt=H}};(function(H,U){(function(g,$){H.exports=$()})(Q,function(){var g,$,T=1e3,S=6e4,M=36e5,w=864e5,x=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,m=31536e6,f=2592e6,p=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,O={years:m,months:f,days:w,hours:M,minutes:S,seconds:T,milliseconds:1,weeks:6048e5},_=function(c){return c instanceof I},y=function(c,r,s){return new I(c,s,r.$l)},j=function(c){return $.p(c)+"s"},P=function(c){return c<0},N=function(c){return P(c)?Math.ceil(c):Math.floor(c)},V=function(c){return Math.abs(c)},W=function(c,r){return c?P(c)?{negative:!0,format:""+V(c)+r}:{negative:!1,format:""+c+r}:{negative:!1,format:""}},I=function(){function c(s,l,h){var o=this;if(this.$d={},this.$l=h,s===void 0&&(this.$ms=0,this.parseFromMilliseconds()),l)return y(s*O[j(l)],this);if(typeof s=="number")return this.$ms=s,this.parseFromMilliseconds(),this;if(typeof s=="object")return Object.keys(s).forEach(function(i){o.$d[j(i)]=s[i]}),this.calMilliseconds(),this;if(typeof s=="string"){var b=s.match(p);if(b){var k=b.slice(2).map(function(i){return i!=null?Number(i):0});return this.$d.years=k[0],this.$d.months=k[1],this.$d.weeks=k[2],this.$d.days=k[3],this.$d.hours=k[4],this.$d.minutes=k[5],this.$d.seconds=k[6],this.calMilliseconds(),this}}return this}var r=c.prototype;return r.calMilliseconds=function(){var s=this;this.$ms=Object.keys(this.$d).reduce(function(l,h){return l+(s.$d[h]||0)*O[h]},0)},r.parseFromMilliseconds=function(){var s=this.$ms;this.$d.years=N(s/m),s%=m,this.$d.months=N(s/f),s%=f,this.$d.days=N(s/w),s%=w,this.$d.hours=N(s/M),s%=M,this.$d.minutes=N(s/S),s%=S,this.$d.seconds=N(s/T),s%=T,this.$d.milliseconds=s},r.toISOString=function(){var s=W(this.$d.years,"Y"),l=W(this.$d.months,"M"),h=+this.$d.days||0;this.$d.weeks&&(h+=7*this.$d.weeks);var o=W(h,"D"),b=W(this.$d.hours,"H"),k=W(this.$d.minutes,"M"),i=this.$d.seconds||0;this.$d.milliseconds&&(i+=this.$d.milliseconds/1e3);var e=W(i,"S"),t=s.negative||l.negative||o.negative||b.negative||k.negative||e.negative,a=b.format||k.format||e.format?"T":"",n=(t?"-":"")+"P"+s.format+l.format+o.format+a+b.format+k.format+e.format;return n==="P"||n==="-P"?"P0D":n},r.toJSON=function(){return this.toISOString()},r.format=function(s){var l=s||"YYYY-MM-DDTHH:mm:ss",h={Y:this.$d.years,YY:$.s(this.$d.years,2,"0"),YYYY:$.s(this.$d.years,4,"0"),M:this.$d.months,MM:$.s(this.$d.months,2,"0"),D:this.$d.days,DD:$.s(this.$d.days,2,"0"),H:this.$d.hours,HH:$.s(this.$d.hours,2,"0"),m:this.$d.minutes,mm:$.s(this.$d.minutes,2,"0"),s:this.$d.seconds,ss:$.s(this.$d.seconds,2,"0"),SSS:$.s(this.$d.milliseconds,3,"0")};return l.replace(x,function(o,b){return b||String(h[o])})},r.as=function(s){return this.$ms/O[j(s)]},r.get=function(s){var l=this.$ms,h=j(s);return h==="milliseconds"?l%=1e3:l=h==="weeks"?N(l/O[h]):this.$d[h],l===0?0:l},r.add=function(s,l,h){var o;return o=l?s*O[j(l)]:_(s)?s.$ms:y(s,this).$ms,y(this.$ms+o*(h?-1:1),this)},r.subtract=function(s,l){return this.add(s,l,!0)},r.locale=function(s){var l=this.clone();return l.$l=s,l},r.clone=function(){return y(this.$ms,this)},r.humanize=function(s){return g().add(this.$ms,"ms").locale(this.$l).fromNow(!s)},r.milliseconds=function(){return this.get("milliseconds")},r.asMilliseconds=function(){return this.as("milliseconds")},r.seconds=function(){return this.get("seconds")},r.asSeconds=function(){return this.as("seconds")},r.minutes=function(){return this.get("minutes")},r.asMinutes=function(){return this.as("minutes")},r.hours=function(){return this.get("hours")},r.asHours=function(){return this.as("hours")},r.days=function(){return this.get("days")},r.asDays=function(){return this.as("days")},r.weeks=function(){return this.get("weeks")},r.asWeeks=function(){return this.as("weeks")},r.months=function(){return this.get("months")},r.asMonths=function(){return this.as("months")},r.years=function(){return this.get("years")},r.asYears=function(){return this.as("years")},c}();return function(c,r,s){g=s,$=s().$utils(),s.duration=function(o,b){var k=s.locale();return y(o,{$l:k},b)},s.isDuration=_;var l=r.prototype.add,h=r.prototype.subtract;r.prototype.add=function(o,b){return _(o)&&(o=o.asMilliseconds()),l.bind(this)(o,b)},r.prototype.subtract=function(o,b){return _(o)&&(o=o.asMilliseconds()),h.bind(this)(o,b)}}})})(pt);const vt=nt;var et={},Mt={get exports(){return et},set exports(H){et=H}};(function(H,U){(function(g,$){H.exports=$(G)})(Q,function(g){function $(M){return M&&typeof M=="object"&&"default"in M?M:{default:M}}var T=$(g),S={name:"zh-cn",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"周日_周一_周二_周三_周四_周五_周六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(M,w){return w==="W"?M+"周":M+"日"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日Ah点mm分",LLLL:"YYYY年M月D日ddddAh点mm分",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s内",past:"%s前",s:"几秒",m:"1 分钟",mm:"%d 分钟",h:"1 小时",hh:"%d 小时",d:"1 天",dd:"%d 天",M:"1 个月",MM:"%d 个月",y:"1 年",yy:"%d 年"},meridiem:function(M,w){var x=100*M+w;return x<600?"凌晨":x<900?"早上":x<1100?"上午":x<1300?"中午":x<1800?"下午":"晚上"}};return T.default.locale(S,null,!0),S})})(Mt);const _t=it({__name:"Home",setup(H){A.locale("zh-cn"),A.extend(vt),A.extend($t);const U=ot(),g=U.theme.value.pages,$=U.theme.value.firstCommit,T=K(),S={light:"svg/pic1.svg",dark:"svg/pic2.svg"},M=K([{text:"随便逛逛",link:x()}]);at(()=>{const f=setInterval(m(),1e3);ut(clearInterval.bind(null,f))});const w=K(g.map(f=>{var _,y;let p=(_=f.content.match(/[\s\S]*?# (\S+?)\s+[\s\S]*/))==null?void 0:_[1];const O=(y=p==null?void 0:p.match(/\{\{\$frontmatter\.(\S+)\}\}/))==null?void 0:y[1];return O&&(p=f.frontMatter[O]),{title:p||f.title,details:f.content.slice(0,200).replace(/#* [\S]+?\s/g,"").replace(/<[^>]+>/g,""),link:f.path,linkText:A(f.frontMatter.date[0]).format("YYYY-MM-DD")}}));function x(){const f=g.length-1;return g[Math.floor(Math.random()*f)].path}function m(){const f=A().diff(A($)),p=A.duration(f).days(),O=A.duration(f).hours(),_=A.duration(f).minutes(),y=A.duration(f).seconds();return T.value=`过去的${p||""}天${O||""}时${_<10?`0${_}`:_}分${y<10?`0${y}`:y}秒中，本站累计更新${g.length}篇文章`,m}return(f,p)=>(st(),rt(ht,null,[R(dt,{name:"XaviDocs",text:"个人技术文档",tagline:T.value,image:S,actions:M.value},null,8,["tagline","actions"]),R(ct,{features:w.value},null,8,["features"])],64))}});const yt=ft(_t,[["__scopeId","data-v-f33b7eb8"]]),Dt=JSON.parse('{"title":"","description":"","frontmatter":{"layout":"home"},"headers":[],"relativePath":"index.md","lastUpdated":1677828264000}'),gt={name:"index.md"},St=Object.assign(gt,{setup(H){return(U,g)=>(st(),rt("div",null,[R(yt)]))}});export{Dt as __pageData,St as default};