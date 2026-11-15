//go:build windows

package main

import (
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

const (
	wmDestroy    = 0x0002
	wmClose      = 0x0010
	wmPaint      = 0x000F
	wmTimer      = 0x0113
	wmEraseBkgnd = 0x0014

	wsChild        = 0x40000000
	wsVisible      = 0x10000000
	wsClipSiblings = 0x04000000

	swpNoActivate = 0x0010
	swpShowWindow = 0x0040
)

var (
	user32 = windows.NewLazySystemDLL("user32.dll")
	gdi32  = windows.NewLazySystemDLL("gdi32.dll")

	procRegisterClassExW = user32.NewProc("RegisterClassExW")
	procCreateWindowExW  = user32.NewProc("CreateWindowExW")
	procDefWindowProcW   = user32.NewProc("DefWindowProcW")
	procDestroyWindow    = user32.NewProc("DestroyWindow")
	procShowWindow       = user32.NewProc("ShowWindow")
	procUpdateWindow     = user32.NewProc("UpdateWindow")
	procSetTimer         = user32.NewProc("SetTimer")
	procKillTimer        = user32.NewProc("KillTimer")
	procBeginPaint       = user32.NewProc("BeginPaint")
	procEndPaint         = user32.NewProc("EndPaint")
	procFillRect         = user32.NewProc("FillRect")
	procDrawTextW        = user32.NewProc("DrawTextW")
	procGetClientRect    = user32.NewProc("GetClientRect")
	procInvalidateRect   = user32.NewProc("InvalidateRect")
	procPeekMessageW     = user32.NewProc("PeekMessageW")
	procTranslateMessage = user32.NewProc("TranslateMessage")
	procDispatchMessageW = user32.NewProc("DispatchMessageW")
	procPostQuitMessage  = user32.NewProc("PostQuitMessage")
	procSetWindowPos = user32.NewProc("SetWindowPos")

	procCreateSolidBrush = gdi32.NewProc("CreateSolidBrush")
	procDeleteObject     = gdi32.NewProc("DeleteObject")
	procCreateFontW      = gdi32.NewProc("CreateFontW")
	procSelectObject     = gdi32.NewProc("SelectObject")
	procSetBkMode        = gdi32.NewProc("SetBkMode")
	procSetTextColor     = gdi32.NewProc("SetTextColor")
)

type wndClassEx struct {
	cbSize        uint32
	style         uint32
	lpfnWndProc   uintptr
	cbClsExtra    int32
	cbWndExtra    int32
	hInstance     windows.Handle
	hIcon         windows.Handle
	hCursor       windows.Handle
	hbrBackground windows.Handle
	lpszMenuName  *uint16
	lpszClassName *uint16
	hIconSm       windows.Handle
}

type winRect struct {
	left, top, right, bottom int32
}

type paintStruct struct {
	hdc         uintptr
	fErase      int32
	rcPaint     winRect
	fRestore    int32
	fIncUpdate  int32
	rgbReserved [32]byte
}

type threadMsg struct {
	hwnd    uintptr
	message uint32
	wParam  uintptr
	lParam  uintptr
	time    uint32
	pt      struct{ x, y int32 }
}

var (
	loadHWND   uintptr
	loadParent uintptr
	loadOffset int32
	loadProc   = syscall.NewCallback(loadingProc)
	classReady bool
	className  *uint16
	loadFont   uintptr
)

func showLoadingIn(parent uintptr) {
	if parent == 0 || loadHWND != 0 {
		return
	}
	loadParent = parent
	className, _ = windows.UTF16PtrFromString("ExamLoadWnd")
	var hinst windows.Handle
	_ = windows.GetModuleHandleEx(0, nil, &hinst)
	if !classReady {
		wc := wndClassEx{
			cbSize:        uint32(unsafe.Sizeof(wndClassEx{})),
			lpfnWndProc:   loadProc,
			hInstance:     hinst,
			hbrBackground: 6,
			lpszClassName: className,
		}
		procRegisterClassExW.Call(uintptr(unsafe.Pointer(&wc)))
		classReady = true
		fontName, _ := windows.UTF16PtrFromString("Microsoft YaHei UI")
		loadFont, _, _ = procCreateFontW.Call(
			uintptr(0xffffffe8), 0, 0, 0, 600, 0, 0, 0, 1, 0, 0, 0, 0,
			uintptr(unsafe.Pointer(fontName)),
		)
	}
	empty, _ := windows.UTF16PtrFromString("")
	hwnd, _, _ := procCreateWindowExW.Call(
		0,
		uintptr(unsafe.Pointer(className)),
		uintptr(unsafe.Pointer(empty)),
		wsChild|wsVisible|wsClipSiblings,
		0, 0, 0, 0,
		parent, 0, uintptr(hinst), 0,
	)
	loadHWND = hwnd
	placeLoading()
	procSetTimer.Call(loadHWND, 1, 30, 0)
	procUpdateWindow.Call(loadHWND)
	pumpLoading()
}

func placeLoading() {
	if loadHWND == 0 || loadParent == 0 {
		return
	}
	var client winRect
	procGetClientRect.Call(loadParent, uintptr(unsafe.Pointer(&client)))
	procSetWindowPos.Call(
		loadHWND, 0,
		0, 0,
		uintptr(client.right-client.left),
		uintptr(client.bottom-client.top),
		swpNoActivate|swpShowWindow,
	)
}

func pumpLoading() {
	var msg threadMsg
	for i := 0; i < 8; i++ {
		r, _, _ := procPeekMessageW.Call(uintptr(unsafe.Pointer(&msg)), 0, 0, 0, 1)
		if r == 0 {
			break
		}
		procTranslateMessage.Call(uintptr(unsafe.Pointer(&msg)))
		procDispatchMessageW.Call(uintptr(unsafe.Pointer(&msg)))
	}
}

func closeLoading() {
	if loadHWND == 0 {
		return
	}
	procKillTimer.Call(loadHWND, 1)
	hwnd := loadHWND
	loadHWND = 0
	loadParent = 0
	procDestroyWindow.Call(hwnd)
}

func loadingProc(hwnd, msg, wp, lp uintptr) uintptr {
	switch msg {
	case wmEraseBkgnd:
		return 1
	case wmTimer:
		loadOffset += 8
		if loadOffset > 240 {
			loadOffset = -80
		}
		placeLoading()
		procInvalidateRect.Call(hwnd, 0, 0)
		return 0
	case wmPaint:
		paintLoading(hwnd)
		return 0
	case wmClose:
		return 0
	case wmDestroy:
		return 0
	}
	r, _, _ := procDefWindowProcW.Call(hwnd, msg, wp, lp)
	return r
}

func paintLoading(hwnd uintptr) {
	var ps paintStruct
	hdc, _, _ := procBeginPaint.Call(hwnd, uintptr(unsafe.Pointer(&ps)))
	var client winRect
	procGetClientRect.Call(hwnd, uintptr(unsafe.Pointer(&client)))
	fillColor(hdc, client, 0x00FFFFFF)

	if loadFont != 0 {
		procSelectObject.Call(hdc, loadFont)
	}
	procSetBkMode.Call(hdc, 1)
	procSetTextColor.Call(hdc, 0x002F3124)
	text, _ := windows.UTF16PtrFromString("内容加载中，请勿关闭窗口")
	cx := (client.left + client.right) / 2
	cy := (client.top + client.bottom) / 2
	textRect := winRect{left: client.left, top: cy - 56, right: client.right, bottom: cy - 12}
	procDrawTextW.Call(hdc, uintptr(unsafe.Pointer(text)), uintptr(0xffffffff), uintptr(unsafe.Pointer(&textRect)), 0x25)

	track := winRect{left: cx - 160, top: cy + 4, right: cx + 160, bottom: cy + 20}
	fillColor(hdc, track, 0x00E5E6E2)
	barLeft := track.left + loadOffset
	barRight := barLeft + 90
	if barLeft < track.left {
		barLeft = track.left
	}
	if barRight > track.right {
		barRight = track.right
	}
	if barRight > barLeft {
		fillColor(hdc, winRect{left: barLeft, top: track.top, right: barRight, bottom: track.bottom}, 0x00867C12)
	}
	procEndPaint.Call(hwnd, uintptr(unsafe.Pointer(&ps)))
}

func fillColor(hdc uintptr, r winRect, color uintptr) {
	brush, _, _ := procCreateSolidBrush.Call(color)
	procFillRect.Call(hdc, uintptr(unsafe.Pointer(&r)), brush)
	procDeleteObject.Call(brush)
}
