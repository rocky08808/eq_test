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

	wsCaption  = 0x00C00000
	wsSysMenu  = 0x00080000
	wsVisible  = 0x10000000
	wsExTopmost = 0x00000008

	swHide = 0
	swShow = 5
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
	procGetSystemMetrics = user32.NewProc("GetSystemMetrics")

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
	loadOffset int32
	loadProc   = syscall.NewCallback(loadingProc)
	classReady bool
	className  *uint16
	loadFont   uintptr
)

func showLoading() {
	if loadHWND != 0 {
		return
	}
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
			uintptr(0xfffffff0), 0, 0, 0, 600, 0, 0, 0, 1, 0, 0, 0, 0,
			uintptr(unsafe.Pointer(fontName)),
		)
	}
	title, _ := windows.UTF16PtrFromString("候选考试")
	width, height := uintptr(520), uintptr(210)
	sw, _, _ := procGetSystemMetrics.Call(0)
	sh, _, _ := procGetSystemMetrics.Call(1)
	hwnd, _, _ := procCreateWindowExW.Call(
		wsExTopmost,
		uintptr(unsafe.Pointer(className)),
		uintptr(unsafe.Pointer(title)),
		wsCaption|wsSysMenu|wsVisible,
		(sw-width)/2, (sh-height)/2, width, height,
		0, 0, uintptr(hinst), 0,
	)
	loadHWND = hwnd
	procSetTimer.Call(loadHWND, 1, 30, 0)
	procUpdateWindow.Call(loadHWND)
	pumpLoading()
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
	procDestroyWindow.Call(hwnd)
}

func hideNativeWindow(hwnd uintptr) {
	if hwnd != 0 {
		procShowWindow.Call(hwnd, swHide)
	}
}

func showNativeWindow(hwnd uintptr) {
	if hwnd != 0 {
		procShowWindow.Call(hwnd, swShow)
	}
}

func loadingProc(hwnd, msg, wp, lp uintptr) uintptr {
	switch msg {
	case wmEraseBkgnd:
		return 1
	case wmTimer:
		loadOffset += 10
		if loadOffset > 300 {
			loadOffset = -100
		}
		procInvalidateRect.Call(hwnd, 0, 0)
		return 0
	case wmPaint:
		paintLoading(hwnd)
		return 0
	case wmClose:
		closeLoading()
		procPostQuitMessage.Call(0)
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
	textRect := client
	textRect.bottom = (client.top + client.bottom) / 2
	procDrawTextW.Call(hdc, uintptr(unsafe.Pointer(text)), uintptr(0xffffffff), uintptr(unsafe.Pointer(&textRect)), 0x25)

	cx := (client.left + client.right) / 2
	track := winRect{left: cx - 140, top: textRect.bottom + 8, right: cx + 140, bottom: textRect.bottom + 22}
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
