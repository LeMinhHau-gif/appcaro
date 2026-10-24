import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BOARD_THEMES, STONE_SKINS } from '../../data/questsAndShop';
import { ShoppingBag, Check, Coins, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

export const ShopScreen: React.FC = () => {
  const { user, equipTheme, equipSkin, buyTheme, buySkin, setActiveTab } = useGame();
  const [shopTab, setShopTab] = useState<'themes' | 'skins'>('themes');
  const [previewThemeId, setPreviewThemeId] = useState(user.equippedTheme);
  const [previewSkinId, setPreviewSkinId] = useState(user.equippedSkin);

  const previewTheme = BOARD_THEMES.find(t => t.id === previewThemeId) || BOARD_THEMES[0];
  const previewSkin = STONE_SKINS.find(s => s.id === previewSkinId) || STONE_SKINS[0];

  const handleEquipTheme = (themeId: string) => {
    equipTheme(themeId);
    setPreviewThemeId(themeId);
  };

  const handleBuyTheme = (themeId: string, price: number) => {
    soundManager.playButtonClick();
    if (buyTheme(themeId, price)) {
      setPreviewThemeId(themeId);
    }
  };

  const handleEquipSkin = (skinId: string) => {
    equipSkin(skinId);
    setPreviewSkinId(skinId);
  };

  const handleBuySkin = (skinId: string, price: number) => {
    soundManager.playButtonClick();
    if (buySkin(skinId, price)) {
      setPreviewSkinId(skinId);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('home');
              soundManager.playButtonClick();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <ShoppingBag size={20} className="text-amber-400" />
              <span>Cửa Hàng Giao Diện & Quân Cờ</span>
            </h2>
            <p className="text-xs text-slate-400">Tùy biến phong cách bàn cờ theo cá tính kỳ thủ</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-2xl text-amber-300">
          <Coins size={15} className="text-amber-400" />
          <span className="text-xs font-bold font-mono tabular-nums">{user.coins} Xu</span>
        </div>
      </div>

      {/* Live Preview Display Box */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl flex flex-col sm:flex-row items-center gap-4">
        {/* Mini 5x5 board preview */}
        <div
          className={`w-36 h-36 rounded-2xl border ${previewTheme.borderColor} ${previewTheme.boardBg} p-2 flex items-center justify-center relative shadow-inner shrink-0`}
        >
          <div className="grid grid-cols-4 gap-2 w-full h-full relative">
            {/* Sample X stone */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono place-self-center"
              style={{
                boxShadow: previewSkin.xGlow,
                backgroundColor: previewTheme.id === 'theme_zen' ? '#0f172a' : '#091522',
                border: `1.5px solid ${previewSkin.xColor}`,
                color: previewSkin.xColor,
              }}
            >
              X
            </div>
            {/* Sample O stone */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono place-self-center col-start-3"
              style={{
                boxShadow: previewSkin.oGlow,
                backgroundColor: previewTheme.id === 'theme_zen' ? '#f8fafc' : '#220b12',
                border: `1.5px solid ${previewSkin.oColor}`,
                color: previewSkin.oColor,
              }}
            >
              O
            </div>
            {/* Sample X stone */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono place-self-center row-start-3 col-start-2"
              style={{
                boxShadow: previewSkin.xGlow,
                backgroundColor: previewTheme.id === 'theme_zen' ? '#0f172a' : '#091522',
                border: `1.5px solid ${previewSkin.xColor}`,
                color: previewSkin.xColor,
              }}
            >
              X
            </div>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            Xem Trước Trực Tiếp
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            {previewTheme.name} + {previewSkin.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Giao diện bàn cờ và hiệu ứng phát quang quân cờ hiển thị khi bạn thi đấu.
          </p>
        </div>
      </div>

      {/* Segmented Shop Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => {
            setShopTab('themes');
            soundManager.playButtonClick();
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            shopTab === 'themes'
              ? 'bg-teal-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Mặt Bàn Cờ ({BOARD_THEMES.length})
        </button>
        <button
          onClick={() => {
            setShopTab('skins');
            soundManager.playButtonClick();
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            shopTab === 'skins'
              ? 'bg-teal-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Màu & Hiệu Ứng Quân Cờ ({STONE_SKINS.length})
        </button>
      </div>

      {/* Themes List */}
      {shopTab === 'themes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BOARD_THEMES.map((theme) => {
            const isUnlocked = user.unlockedThemes.includes(theme.id);
            const isEquipped = user.equippedTheme === theme.id;
            const canAfford = user.coins >= theme.price;
            const hasRequiredStars = !theme.requiredStars || user.stars >= theme.requiredStars;

            return (
              <div
                key={theme.id}
                onClick={() => setPreviewThemeId(theme.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-slate-900 border-teal-500/80 shadow-md shadow-teal-500/10'
                    : previewThemeId === theme.id
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{theme.name}</span>
                    {isEquipped && (
                      <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                        Đang Dùng
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{theme.description}</p>

                  {theme.requiredStars && !isUnlocked && (
                    <div className="text-[10px] text-amber-400 flex items-center gap-1 mb-2">
                      <Star size={11} className="fill-amber-400" />
                      <span>Cần đạt {theme.requiredStars} sao chiến dịch</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                    {theme.price === 0 ? 'Mặc Định' : `${theme.price} Xu`}
                  </div>

                  {isEquipped ? (
                    <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 text-xs font-semibold flex items-center gap-1">
                      <Check size={13} />
                      Đã chọn
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquipTheme(theme.id);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                    >
                      Trang Bị
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAfford && hasRequiredStars) {
                          handleBuyTheme(theme.id, theme.price);
                        }
                      }}
                      disabled={!canAfford || !hasRequiredStars}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold transition-colors"
                    >
                      Mua Ngay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stone Skins List */}
      {shopTab === 'skins' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STONE_SKINS.map((skin) => {
            const isUnlocked = user.unlockedSkins.includes(skin.id);
            const isEquipped = user.equippedSkin === skin.id;
            const canAfford = user.coins >= skin.price;

            return (
              <div
                key={skin.id}
                onClick={() => setPreviewSkinId(skin.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-slate-900 border-teal-500/80 shadow-md shadow-teal-500/10'
                    : previewSkinId === skin.id
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{skin.name}</span>
                    {isEquipped && (
                      <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                        Đang Dùng
                      </span>
                    )}
                  </div>

                  {/* Visual preview of stones */}
                  <div className="flex items-center gap-3 my-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono"
                      style={{
                        boxShadow: skin.xGlow,
                        backgroundColor: '#091522',
                        border: `1.5px solid ${skin.xColor}`,
                        color: skin.xColor,
                      }}
                    >
                      X
                    </div>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs font-mono"
                      style={{
                        boxShadow: skin.oGlow,
                        backgroundColor: '#220b12',
                        border: `1.5px solid ${skin.oColor}`,
                        color: skin.oColor,
                      }}
                    >
                      O
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    {skin.price === 0 ? 'Mặc Định' : `${skin.price} Xu`}
                  </div>

                  {isEquipped ? (
                    <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 text-xs font-semibold flex items-center gap-1">
                      <Check size={13} />
                      Đã chọn
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquipSkin(skin.id);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                    >
                      Trang Bị
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAfford) {
                          handleBuySkin(skin.id, skin.price);
                        }
                      }}
                      disabled={!canAfford}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold transition-colors"
                    >
                      Mua Ngay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
