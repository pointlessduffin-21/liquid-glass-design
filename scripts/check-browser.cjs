const { chromium, firefox, webkit } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const engine = process.env.BROWSER || 'chromium';
  const browser = await ({ chromium, firefox, webkit }[engine]).launch(process.env.CHROME_CHANNEL ? {channel:process.env.CHROME_CHANNEL} : {});
  const kitRoot = path.resolve('kit');
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/healthz') { response.end('ok'); return; }
    const file = path.resolve(kitRoot, pathname.replace(/^\/(?:kit|static)\//, ''));
    if (!file.startsWith(kitRoot + path.sep) || !fs.existsSync(file)) { response.writeHead(404);response.end();return; }
    response.setHeader('Content-Type', ({'.html':'text/html','.css':'text/css','.js':'text/javascript'}[path.extname(file)] || 'text/plain'));
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const go = file => page.goto(`${base}/kit/${file}`);
  await go('demo-system.html');
  await page.evaluate(() => LiquidGlass.setTheme({accent:'#8b3be0',background:'#f1e9ff'}));
  const purple = await page.locator('#show').evaluate(el => getComputedStyle(el).backgroundImage);
  assert.ok(purple.includes('139, 59, 224'), purple);
  const oldTheme = await page.evaluate(() => document.documentElement.style.cssText);
  const invalid = await page.evaluate(() => {try {LiquidGlass.setTheme({accent:'bad'}); return false;} catch {return true;}});
  assert.equal(invalid, true); assert.equal(await page.evaluate(() => document.documentElement.style.cssText), oldTheme);
  await page.evaluate(() => LiquidGlass.setTheme({accent:'#ffff00',background:'#e6efff',field:false}));
  assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundImage), 'none');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#show')).color === 'rgb(16, 36, 26)');
  for (const effect of ['pop', 'fade', 'slide']) {
    await page.evaluate(effect => LiquidGlass.hide(document.querySelector('#sample'), {effect,duration:30}), effect);
    assert.equal(await page.locator('#sample').evaluate(el=>el.hidden), true);
    await page.evaluate(effect => LiquidGlass.show(document.querySelector('#sample'), {effect,duration:30}), effect);
    assert.equal(await page.locator('#sample').evaluate(el=>el.hidden), false);
  }
  const race = await page.evaluate(async () => {
    const el = document.querySelector('#sample');
    const out = LiquidGlass.hide(el,{duration:400});
    const incoming = LiquidGlass.show(el,{duration:40});
    return [await out, await incoming, el.hidden, el.style.willChange, el.getAnimations().length];
  });
  assert.deepEqual(race,[{cancelled:true},{cancelled:false},false,'',0]);
  await page.evaluate(() => {
    const input = document.createElement('button'); input.textContent='Focusable';
    document.querySelector('#sample').append(input); input.focus();
    return LiquidGlass.hide(document.querySelector('#sample'), {duration:0,focusTarget:document.querySelector('#show')});
  });
  assert.equal(await page.evaluate(()=>document.activeElement.id),'show');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>LiquidGlass.show(document.querySelector('#sample')));
  assert.equal(await page.locator('#sample').evaluate(el=>el.getAnimations().length),0);
  await page.locator('#opaque').check();
  assert.equal(await page.locator('.glass-menubar').evaluate(el=>getComputedStyle(el).backdropFilter),'none');
  await page.locator('#opaque').uncheck(); await page.locator('#lite').check();
  assert.equal(await page.locator('.glass-menubar').evaluate(el=>getComputedStyle(el).backdropFilter),'none');
  await page.setViewportSize({width:390,height:844});
  const toggle=page.locator('[data-glass-menu]'), nav=page.locator('#demo-navigation');
  await page.waitForFunction(()=>document.querySelector('#demo-navigation').hidden);
  await toggle.click(); assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  await nav.locator('a').first().focus(); await page.keyboard.press('Escape');
  assert.equal(await nav.evaluate(el=>el.hidden),true); assert.equal(await toggle.evaluate(el=>el===document.activeElement),true);
  await toggle.click(); await page.locator('h1').click(); assert.equal(await nav.evaluate(el=>el.hidden),true);
  await toggle.click(); await nav.locator('a').last().click(); assert.equal(await nav.evaluate(el=>el.hidden),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.setViewportSize({width:1440,height:1000}); await page.waitForFunction(()=>!document.querySelector('#demo-navigation').hidden);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>LiquidGlass.setTheme({accent:'#4f46e5',background:'#eef0ff'}));
  await go('demo-system.html');
  await page.locator('#accent').fill('#4f46e5');
  await page.locator('#background').fill('#eef0ff');
  await page.waitForFunction(()=>document.querySelector('#theme-status').textContent.includes('#4f46e5'));
  fs.mkdirSync('artifacts',{recursive:true});
  await page.screenshot({path:`artifacts/${engine}-system-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844}); await page.waitForFunction(()=>document.querySelector('#demo-navigation').hidden); await toggle.click();
  await page.waitForFunction(()=>document.querySelector('#demo-navigation').getAnimations().length===0);
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:`artifacts/${engine}-system-mobile.png`,fullPage:true});
  // Sample frames while repeatedly running transform/opacity transitions.
  const stats=await page.evaluate(async()=>{
    const sample=document.querySelector('#sample'); let last; const frames=[];
    const measure=new Promise(resolve=>{let count=0; function tick(now){if(last)frames.push(now-last);last=now;if(++count<45)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
    await LiquidGlass.show(sample); await LiquidGlass.hide(sample); await LiquidGlass.show(sample); await measure;
    frames.sort((a,b)=>a-b); return {medianMs:frames[Math.floor(frames.length*.5)],p95Ms:frames[Math.floor(frames.length*.95)]};
  });
  await go('demo-buttons.html');
  await page.evaluate(()=>{window.count=0;document.querySelector('#clear').addEventListener('click',()=>window.count++);});
  const button=page.locator('#clear');const rect=await button.boundingBox(); const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
  await page.mouse.click(x,y); assert.equal(await page.evaluate(()=>count),1);
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+35,y,{steps:5});await page.mouse.up();
  assert.equal(await page.evaluate(()=>count),1);
  await button.focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>count),2);
  assert.equal(await button.evaluate(el=>el.classList.contains('glass-held')),false);
  // Native dialog keeps modal semantics while entry/exit animate.
  await page.setViewportSize({width:1440,height:1000});
  await go('template-app.html');
  await page.locator('#open-dialog').click();
  await page.waitForFunction(()=>document.querySelector('#item-dialog').open);
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#item-dialog').open);
  assert.equal(await page.locator('#item-dialog').evaluate(el=>el.hidden),false);
  await page.locator('#open-dialog').click();
  await page.locator('#item-dialog button[value=cancel]').click();
  await page.waitForFunction(()=>!document.querySelector('#item-dialog').open);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'open-dialog');
  // Actual touchscreen taps on a mobile context (WebKit covers the mobile engine).
  if (engine !== 'firefox') {
    const mobile = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const touch = await mobile.newPage(); await touch.goto(`${base}/kit/demo-system.html`);
    await touch.locator('[data-glass-menu]').tap();
    await touch.waitForFunction(()=>document.querySelector('[data-glass-menu]').getAttribute('aria-expanded')==='true');
    await touch.locator('#demo-navigation a').last().tap();
    await touch.waitForFunction(()=>document.querySelector('#demo-navigation').hidden);
    assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await mobile.close();
  }
  assert.deepEqual(errors,[]);
  console.log(`${engine}: themes, all effects, interrupted animations, cleanup, focus, reduced motion, quality modes, mobile navigation, overflow, and button regression passed.`);
  console.log('Local frame sample (not a device guarantee):', JSON.stringify(stats));
  await browser.close(); await new Promise(resolve=>server.close(resolve));
})().catch(error=>{console.error(error);process.exit(1);});
