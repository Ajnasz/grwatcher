#!/bin/zsh



locales="ca-AD cs da de el el-GR en-US es-AR es-ES et-EE fa-IR fi-FI fr gl-ES he-IL hu-HU it-IT ja ko-KR ms-MY nl nl-NL pl pl-PL pt-BR pt-PT ru-RU sk-SK sr sv-SE tr-TR vi zh-CN zh-TW"
strings="GRWstatusbar.popup.markAllAsRead GRWstatusbar.popup.openReader GRWstatusbar.popup.openPrefs GRWstatusbar.popup.getReadCounter GRWstatusbar.popup.enableCookies"

for locale in $locales;
do
  for str in $strings;
  do
    echo -n "$str=" | sed s/\\.//g | sed s/GRWstatusbar/toolbar/ | tr '[:upper:]' '[:lower:]' >> locale/$locale/grwatcher.properties
    grep $str locale/$locale/grwatcher.dtd | awk '{print gensub(/^.+ "(.+)">$/, "\\1", 1)}' >> locale/$locale/grwatcher.properties
  done;
done;
