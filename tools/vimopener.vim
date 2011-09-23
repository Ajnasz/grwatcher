function! s:GetModuleName(name)
  let l:output = a:name
  if(a:name =~ "^resource://grwmodules")
    let output = substitute(a:name, "resource://grwmodules", "modules", "")
  endif
  return l:output
endfunction

function! s:FileRead()
  return "edit " . s:GetModuleName(expand('<amatch>'))
endfunction

function! GetGrwFNName(name)
  let l:output = s:GetModuleName(a:name)
  return l:output
endfunction
au BufReadCmd   resource://* exe s:FileRead()
set includeexpr=GetGrwFNName(v:fname)
set isf+=:
set include=Components.utils.import("resource[:/]\+.\+")
