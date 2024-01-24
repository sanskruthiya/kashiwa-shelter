const map = L.map('map', {
    zoomControl: false,
    zoomSnap: 0.5,
    minZoom: 12,
    maxZoom: 18,
    condensedAttributionControl: false
}).setView([35.8622,139.9709],13);

L.control.condensedAttribution({
    emblem: '&copy;',
    prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet-Слава Україні!</a> | &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors | <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>'
  }).addTo(map);

const bounds = [[36.2000,139.8000], [35.5000,140.4000]];
map.setMaxBounds(bounds);

//const basemap_osm = L.tileLayer('https://{s}.tile.openstreetmap.jp/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom: 28});
const basemap_osm = L.tileLayer('https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom: 28});
const basemap_gsi = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',maxZoom: 18});

const flood_gsi = L.tileLayer('https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://disaportal.gsi.go.jp/index.html">重ねるハザードマップ</a>',maxZoom: 17});
const boundary_style = {"fillColor":"transparent", "color":"#ff7800", "weight":5, "opacity": 0.7};
const boundary_layer = new L.geoJson(json_boundary, {style:boundary_style});

const label_marker = {
    radius: 0,
    fillColor: "transparent",
    color: "transparent",
    weight: 0,
    opacity: 0,
    fillOpacity: 1.0
};

const TooltipClass = {
    'className': 'class-tooltip'
}
  
function onEachFeature_label(feature, layer){
    const label = feature.properties.name_tag;
    const tooltipContent = '<p class="tipstyle03">'+label+'</p>';
    layer.bindTooltip(tooltipContent, {permanent: true, direction: 'center', opacity:0.9, ...TooltipClass});
}

const label_layer = new L.geoJson(label_data, {
    onEachFeature: onEachFeature_label,
    pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng, label_marker);
    }
});

function onEachFeature_spot(feature, layer){
    let popupContent;
    popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td><a href="https://www.google.com/search?q=柏市+'+ feature.properties.name +'" target="_blank">'+(feature.properties.name)+'</a></td></tr>'+
        '<tr><td>エリア</td><td>'+(feature.properties.community_name)+'</td></tr>'+
        '<tr><td>連絡先</td><td>'+(feature.properties.tel)+'</td></tr>'+
        '<tr><td>一時避難<br>可能人数</td><td>'+(feature.properties.site_capacity === "－" ? "－" : parseInt(feature.properties.site_capacity).toLocaleString() +"人") +'</td></tr>'+
        '<tr><td>滞在避難<br>可能人数</td><td>'+(feature.properties.shelter_capacity_per2m2 === "－" ? "－" : parseInt(feature.properties.shelter_capacity_per2m2).toLocaleString() +"人") +'</td></tr>'+
        '<tr><td>併設設備等</td><td>'+(feature.properties.note)+'</td></tr>'+
        '</table>';
    const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
    layer.bindPopup(popupStyle);
}

function onEachFeature_place(feature, layer){
    let popupContent;
    popupContent =
        '<table class="tablestyle02">'+
        '<tr><td>名称</td><td><a href="https://www.google.com/search?q=柏市+'+ feature.properties.name +'" target="_blank">'+(feature.properties.name)+'</a></td></tr>'+
        '<tr><td>エリア</td><td>'+(feature.properties.community_name)+'</td></tr>'+
        '<tr><td>連絡先</td><td>'+(feature.properties.tel)+'</td></tr>'+
        '<tr><td>一時避難<br>可能人数</td><td>'+(feature.properties.site_capacity === "－" ? "－" : parseInt(feature.properties.site_capacity).toLocaleString() +"人") +'</td></tr>'+
        '<tr><td>併設設備等</td><td>'+(feature.properties.note)+'</td></tr>'+
        '</table>';
    const popupStyle = L.popup({autoPan:true}).setContent(popupContent);
    layer.bindPopup(popupStyle);
}

const poi_place_layer = new L.geoJson(json_poi, {
    filter: function(feature, layer) {
        return feature.properties.type.startsWith('緊急避難場所');
    },
    onEachFeature: onEachFeature_place,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'green', prefix:'fa', html:("一時")})});
    }
});

const poi_spot_layer = new L.geoJson(json_poi, {
    filter: function(feature, layer) {
        return feature.properties.type.startsWith('避難所');
    },
    onEachFeature: onEachFeature_spot,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'blue', prefix:'fa', html:("滞在")})});
    }
});

const poi_area_layer = new L.geoJson(json_poi, {
    filter: function(feature, layer) {
        return feature.properties.type.startsWith('広域避難場所');
    },
    onEachFeature: onEachFeature_place,
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {icon: L.AwesomeMarkers.icon({icon:'', markerColor:'purple', prefix:'fa', html:("広域")})});
    }
});

const location_group = L.layerGroup([label_layer, boundary_layer])

basemap_osm.addTo(map);
location_group.addTo(map);
poi_place_layer.addTo(map);
poi_spot_layer.addTo(map);
poi_area_layer.addTo(map);

const info = L.control({position:'bottomleft'});
info.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<p class="info-title">柏市の防災避難所マップ</p><p class="comments"><a href="https://www.city.kashiwa.lg.jp/anshinanzen/disaster/index.html" target="_blank">参考：柏市防災対策</a></p>';
    return this._div;
}
info.addTo(map);

const legend_floodrisk = L.control({position:'topright'});
legend_floodrisk.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'map-overlay');
    this._div.innerHTML = '<i class="style01" style="background:#ffffe0"></i>浸水想定：0.5m未満<br><i class="style01" style="background:#f5deb3"></i>浸水想定：0.5m〜3m<br><i class="style01" style="background:#ffc0cb"></i>浸水想定：3m〜5m<br><i class="style01" style="background:#f08080"></i>浸水想定：5m〜10m';
    return this._div;
}

const overlayMaps = {
    '<i class="fas fa-map-marker-alt" style="color:#9acd32"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>一時避難用 緊急避難場所': poi_place_layer,
    '<i class="fas fa-map-marker-alt" style="color:#00bfff"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>滞在用 避難所': poi_spot_layer,
    '<i class="fas fa-map-marker-alt" style="color:#ee82ee"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>大規模災害用 広域避難場所': poi_area_layer,
    '<i class="fas fa-font" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>ラベル・市界': location_group,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>洪水浸水想定区域': flood_gsi,
};

const baseMaps = {
    '<i class="far fa-map" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>地図（OpenStreetMap）': basemap_osm,
    '<i class="far fa-image" style="color:#555"></i><i class="fa fa-caret-right fa-fw" style="color:#555"></i>航空写真（国土地理院）': basemap_gsi,
};

const slidemenutitle = '<h3 align="center">柏市の防災避難所マップ<br>（ 2024年1月版 ）</h3>';
let contents ='<p class="remark" align="left"><ul><li>この説明画面を閉じるには、ここの右斜め上にある <i class="fa fa-backward" style="color:grey"></i> ボタンを押してください。</li><li>ご連絡は<a href="https://form.run/@party--1681740493" target="_blank">問い合わせフォーム（外部サービス）</a>へお願いします。</li></ul></p>';
contents += '<h2>凡例</h2>'
contents += '<table border="0" bordercolor="#999" cellpadding="5" cellspacing="0"><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:#9acd32"></i> :</td><td width="180">緊急避難場所</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:#00bfff"></i> :</td><td width="180">避難所</td></tr><tr><td align="right" width="120"><i class="fas fa-map-marker-alt" style="color:#ee82ee"></i> :</td><td width="180">広域避難場所</td></tr></table>';
contents += '<p align="left"><ul><li><span class="style01">緊急避難場所</span> - 地域において、災害などが発生、または、発生する恐れのある場合に一時的に避難し、身の安全を確保することができるオープンスペースのこと（学校の運動場（校庭）、公園などの屋外）</li>';
contents += '<li><span class="style01">避難所</span> - 災害などにより、住居を失うなど、自宅での生活が困難となり、引き続き避難を必要とする人や帰宅困難者が、一定の期間、避難生活をする所（学校の屋内運動場（体育館）、近隣センターなどの屋内）</li>';
contents += '<li><span class="style01">広域避難場所</span> - 地震などによる大規模な災害発生時に避難する、相当程度の広さが確保されているオープンスペースのこと</li></ul></p>';
contents += '<h2>参考情報</h2><p align="left"><ul><li><a href="https://www.city.kashiwa.lg.jp/anshinanzen/disaster/disaster_ready/hinanbasho/index.html" target="_blank">柏市 避難場所一覧</a></li>';
contents += '<li><a href="https://www.city.kashiwa.lg.jp/anshinanzen/disaster/disaster_ready/bosaimap/index.html" target="_blank">柏市 防災関連地図（マップ）</a></li>';
contents += '<li><a href="https://www.city.kashiwa.lg.jp/databunseki/shiseijoho/jouhoukoukai/opendate/kokainitsuite.html" target="_blank">柏市 オープンデータの公開 指定緊急避難場所・指定避難所一覧</a></li>';
contents += '<li><a href="https://disaportal.gsi.go.jp/index.html">洪水浸水想定区域 - 重ねるハザードマップ</a></li>';
contents += '<li><a href="https://www.openstreetmap.org/" target="_blank">背景地図 - OpenStreetMap</a></li>';
contents += '<li><a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">航空写真 - 地理院タイル</a></li></ul></p>';
contents += '<h2>説明</h2><p align="left"><ul><li>このウェブページは上記の参考情報をもとに、<span class="style01">当サイト管理者が独自に加工・作成したもの</span>です。</li>'
contents += '<li><span class="style01">柏市内に滞在中であれば</span>、スマートフォンなどお使いの機器の位置情報取得を許可し、<i class="fas fa-crosshairs" style="color:black"></i>　ボタンを押すことで、<span class="style01">現在位置を表示</span>することができます。</li>'
contents += '<li>「m」ボタンを押すと、<span class="style01">マップ上で距離を簡易計測できます</span>。また、計測時に描画した線は「x」ボタンによって消去できます。</li>'
contents += '<li>なお、本ウェブサイトがご利用者様の位置情報等を含め<span class="style01">個人情報を記録することは一切ございません</span>のでご安心ください。</li>'
contents += '<li>ご意見等は<a href="https://form.run/@party--1681740493" target="_blank">問い合わせフォーム（外部サービス）</a>からお知らせください。</li></ul></p>';

map.on('overlayadd', function (eventLayer) {
    if (eventLayer.layer === flood_gsi) {
      legend_floodrisk.addTo(map);
    }
});

map.on('overlayremove', function (eventLayer) {
    if (eventLayer.layer === flood_gsi) {
      legend_floodrisk.remove(map);
    }
});

//L.control.layers(baseMaps, overlayMaps,{collapsed:false}).addTo(map);
if (L.Browser.mobile) {
    L.control.layers(baseMaps, overlayMaps, {collapsed:true}).addTo(map).expand();
}
else{
    L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(map);
}

L.control.slideMenu(slidemenutitle + contents, {width:'360px', icon:'fas fa-info'}).addTo(map);
L.control.polylineMeasure({position:'topleft', imperial:false, showClearControl:true, measureControlLabel:'m'}).addTo(map);
L.control.locate({position:'topleft', icon:'fas fa-crosshairs'}).addTo(map);
L.control.scale({maxWidth:120, metric:true, imperial:false, position: 'topleft'}).addTo(map);
