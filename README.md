# 十三アートフェスマップ2026

十三アートフェス2026の会場・展示・イベントと、街の壁画「淀壁」を探すためのマップです。

## イベント概要

- 開催期間：2026年11月21日（土）〜29日（日）
- 開催地域：十三を中心に、神崎川・西中島エリア
- 内容：アート展示、ライブ、ワークショップ、フェス限定メニューなど
- 主催：NPO法人 淀川アートネット
- [公開マップ](https://armd-02.github.io/JusoArtFes2026/)
- [公式イベント情報](https://yodogawaartnet.sakura.ne.jp/category/artfes2026/)

会場ごとの開催日時・料金・予約の有無は、各会場の詳細をご確認ください。

## このマップの設定

主な設定は [data/config-user.jsonc](data/config-user.jsonc) にまとめています。

| 項目 | 設定内容 |
| --- | --- |
| 初期表示 | 十三周辺、ズーム15、傾斜30度 |
| 背景地図 | `OSMFJ_NOPOI` |
| 会場・地物データ | `static.use: true`。[アート](data/st_artwork.jsonc)・[店舗施設](data/st_stores.jsonc)の静的OSMデータを使用 |
| 展示・イベント情報 | バックエンドのプロジェクト `jusoartfes2026`。投稿IDは `WP/…`、認証方式は `basic` |
| 投稿項目 | [data/config-activities.jsonc](data/config-activities.jsonc) の `activities.WP` |
| 一覧 | 活動情報を対象に、会場名・タイトル・作家・開催日時を表示。`listTable.allActs: true` |
| 地図アイコンの絞り込み | `poiView.poiFilter: "filter"`。`"all"` に変更すると一覧だけを絞り込み、地図は全件表示を維持 |
| 写真アイコン | `icon.photoMarkers.use: true` |
| 縮小画像 | `thumbnail.backend.use: true`。このプロジェクトのサムネイルAPIを使用 |
| 3D表示・ミニマップ・屋内表示 | `feature3d.use`・`minimap.use`・`indoor.use` はいずれも `false` |
| 編集モード | 初期値は `etc.editMode: false`。`etc.editModeSwitch: true` で切り替え可能 |
| 自分用メモ欄 | `etc.showPersonalMemo: false` |
| 額縁・装飾画像 | `mapIllustrations.use: true`。左上にスプラッシュ画像、右下に三洋堂の画像を配置。[配置設定](docs/map-illustrations.md) |

イベント情報の取得先は `activity.url`、互換設定は `google.AppScript` です。どちらも `activities.php?app=jusoartfes2026` を指定しています。

一覧の項目・表示形式は [data/listtable.jsonc](data/listtable.jsonc)、表示する地物とスタイルは [data/overpass-custom.jsonc](data/overpass-custom.jsonc) を参照してください。

## 画像・データの取り扱い

**[yodokabe/](yodokabe/) 内の画像はオープンデータではありません。** 各画像・作品の権利はそれぞれの権利者に帰属し、このリポジトリのコードに適用されるMITライセンスの対象には含まれません。転載・再配布・改変などの利用には、権利者の許諾または別途明示された利用条件の確認が必要です。

淀壁の作品と画像の対応は [data/yodokabe-2025-images.json](data/yodokabe-2025-images.json) を参照してください。スプラッシュ画像など、その他の画像にも各提供元の権利・利用条件が適用されます。

OpenStreetMap由来の地図データは、[OpenStreetMapの著作権・ライセンス](https://www.openstreetmap.org/copyright)に従います。コードのライセンスは [LICENSE](LICENSE) と [LICENSE.community_mapmaker](LICENSE.community_mapmaker) を参照してください。

## システム・関連リンク

共通システムの機能、導入・公開方法、設定項目、開発情報は **[Community Map Maker](https://github.com/K-Sakanoshita/community_mapmaker)** を参照してください。

- [Community Map Maker バックエンド](https://github.com/K-Sakanoshita/community_mapmaker_backend)
- [前年版の十三アートフェスマップ](https://github.com/armd-02/JusoArtFes2025)
- [変更履歴](https://github.com/armd-02/JusoArtFes2026/commits/main/)
