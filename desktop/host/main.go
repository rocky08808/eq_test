package main

import (
	"os/exec"

	"github.com/jchv/go-webview2"
)

const startURL = "https://test.olxp.cc/"

const loadingPage = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:#fff;color:#24312f;font-family:"Microsoft YaHei UI",sans-serif}
.box{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font-size:18px}
.track{width:280px;height:8px;background:#e2e6e5;border-radius:99px;overflow:hidden}
.bar{height:100%;width:40%;background:#127c86;border-radius:99px;animation:m 1.1s ease-in-out infinite}
@keyframes m{0%{margin-left:-40%}100%{margin-left:100%}}
</style></head><body><div class="box"><div>内容加载中，请勿关闭窗口</div><div class="track"><div class="bar"></div></div></div>
<script>setTimeout(function(){location.replace('https://test.olxp.cc/')},350)</script></body></html>`

func main() {
	w := webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     false,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:  "候选考试",
			Width:  1200,
			Height: 860,
			IconId: 1,
			Center: true,
		},
	})
	if w == nil {
		openInBrowser()
		return
	}
	defer w.Destroy()
	w.SetSize(900, 640, webview2.HintMin)
	w.Init(`document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a');if(a&&a.target==='_blank'&&a.href){e.preventDefault();location.href=a.href;}},true);`)
	w.Init(`if(location.hostname==='test.olxp.cc'){(function(){var d=document.createElement('div');d.id='exam-loading';d.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font-family:"Microsoft YaHei UI",sans-serif;color:#24312f;font-size:18px';d.innerHTML='<div>内容加载中，请勿关闭窗口</div><div style="width:280px;height:8px;background:#e2e6e5;border-radius:99px;overflow:hidden"><div style="height:100%;width:40%;background:#127c86;border-radius:99px;animation:exam-m 1.1s ease-in-out infinite"></div></div>';var s=document.createElement('style');s.textContent='@keyframes exam-m{0%{margin-left:-40%}100%{margin-left:100%}}';(document.head||document.documentElement).appendChild(s);function mount(){if(!document.getElementById('exam-loading'))(document.body||document.documentElement).appendChild(d)}if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);function hide(){var n=document.getElementById('exam-loading');if(n)n.remove()}document.addEventListener('DOMContentLoaded',function(){requestAnimationFrame(function(){requestAnimationFrame(hide)})});})()}`)
	w.SetHtml(loadingPage)
	w.Run()
}

func openInBrowser() {
	_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", startURL).Start()
}
