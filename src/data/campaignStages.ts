import { CampaignStage } from '../types/game';

export const CAMPAIGN_REALMS = [
  { id: 1, name: 'Làng Khởi Nghiệp', subtitle: 'Novice Village', stageRange: [1, 10], color: 'emerald' },
  { id: 2, name: 'Rừng Trúc Bát Quái', subtitle: 'Bamboo Grove', stageRange: [11, 20], color: 'teal' },
  { id: 3, name: 'Dòng Sông Khắc Tinh', subtitle: 'River of Counters', stageRange: [21, 30], color: 'cyan' },
  { id: 4, name: 'Đỉnh Ngọa Long', subtitle: 'Dragon Peak', stageRange: [31, 40], color: 'amber' },
  { id: 5, name: 'Đền Thờ Kỳ Thánh', subtitle: 'Master Temple', stageRange: [41, 50], color: 'rose' },
];

const OPPONENT_NAMES = [
  { name: 'Tiểu Đồng', title: 'Tập sự nhập môn', diff: 'easy', elo: 850 },
  { name: 'Mộc Thần', title: 'Kỳ thủ thôn Đoài', diff: 'easy', elo: 920 },
  { name: 'Bạch Hạc', title: 'Hạc trắng lướt cờ', diff: 'easy', elo: 980 },
  { name: 'Thanh Phong', title: 'Gió thoảng đầu thu', diff: 'easy', elo: 1040 },
  { name: 'Hắc Vân', title: 'Mây đen che núi', diff: 'easy', elo: 1100 },
  { name: 'Chu Tước', title: 'Tiểu hiệp lanh lợi', diff: 'easy', elo: 1150 },
  { name: 'Lôi Đình', title: 'Sấm sét ven rừng', diff: 'easy', elo: 1200 },
  { name: 'Huyền Vũ', title: 'Phòng thủ sơ cấp', diff: 'easy', elo: 1250 },
  { name: 'Kim Giác', title: 'Trấn ải Làng Thôn', diff: 'easy', elo: 1300 },
  { name: 'Lão Trưởng Thôn', title: 'Thủ lĩnh sơ đồ', diff: 'easy', elo: 1350 },

  // Realm 2
  { name: 'Trúc Tiên Nhân', title: 'Hộ vệ rừng trúc', diff: 'medium', elo: 1400 },
  { name: 'Bích Diệp', title: 'Lá biếc cản gió', diff: 'medium', elo: 1430 },
  { name: 'Phong Hầu', title: 'Khỉ nhanh tay cờ', diff: 'medium', elo: 1460 },
  { name: 'Vân Du Sư', title: 'Đạo sĩ vân du', diff: 'medium', elo: 1490 },
  { name: 'Vô Danh Kiếm', title: 'Kiếm khách ẩn dật', diff: 'medium', elo: 1520 },
  { name: 'Tử Cầm', title: 'Đàn tơ dẫn nhịp', diff: 'medium', elo: 1550 },
  { name: 'Thanh Trúc Khách', title: 'Chuyên bẫy ba cờ', diff: 'medium', elo: 1580 },
  { name: 'Tàn Dạ', title: 'Đêm tàn phản công', diff: 'medium', elo: 1610 },
  { name: 'Xích Hổ', title: 'Hổ lửa hung hãn', diff: 'medium', elo: 1640 },
  { name: 'Bát Quái Tôn Giả', title: 'Chủ rừng trúc cổ', diff: 'medium', elo: 1680 },

  // Realm 3
  { name: 'Thủy Thần Bá', title: 'Sóng ngầm cuộn trào', diff: 'medium', elo: 1710 },
  { name: 'Ngư Ông Tọa', title: 'Ngồi câu cá lớn', diff: 'medium', elo: 1740 },
  { name: 'Ba Đào', title: 'Sóng dữ dâng cao', diff: 'medium', elo: 1770 },
  { name: 'Băng Lam Sư', title: 'Đóng băng thế cờ', diff: 'medium', elo: 1800 },
  { name: 'Hải Long', title: 'Rồng biển vẫy đuôi', diff: 'hard', elo: 1840 },
  { name: 'Triều Tịch', title: 'Thủy triều lên xuống', diff: 'hard', elo: 1870 },
  { name: 'Minh Kính', title: 'Gương sáng soi nước', diff: 'hard', elo: 1900 },
  { name: 'Lưu Tinh Khách', title: 'Nước chảy đá mòn', diff: 'hard', elo: 1930 },
  { name: 'U Thủy Nữ Lang', title: 'Bẫy xoáy tử thần', diff: 'hard', elo: 1960 },
  { name: 'Hà Thần Tôn Giả', title: 'Chúa tể dòng sông', diff: 'hard', elo: 2000 },

  // Realm 4
  { name: 'Cương Sơn Quyết', title: 'Đá tảng bất động', diff: 'hard', elo: 2040 },
  { name: 'Phong Lôi Kích', title: 'Sấm chớp liên hoàn', diff: 'hard', elo: 2080 },
  { name: 'Thiên Hỏa Luyện', title: 'Lửa trời đốt địch', diff: 'hard', elo: 2120 },
  { name: 'Ảo Ảnh Tông Sư', title: 'Hư hư thực thực', diff: 'hard', elo: 2160 },
  { name: 'Cửu Long Chưởng', title: 'Chín rồng cuộn sóng', diff: 'hard', elo: 2200 },
  { name: 'Bạch Hổ Tướng', title: 'Tướng quân bạch hổ', diff: 'hard', elo: 2240 },
  { name: 'Xích Long Kỳ', title: 'Cờ đỏ ngập trời', diff: 'hard', elo: 2280 },
  { name: 'Đoạt Mệnh Thủ', title: 'Bắt tướng diệt cờ', diff: 'hard', elo: 2320 },
  { name: 'Ngọa Long Quân Sư', title: 'Mưu lược khôn lường', diff: 'hard', elo: 2360 },
  { name: 'Ngọa Long Chân Nhân', title: 'Đỉnh cao ngọa long', diff: 'hard', elo: 2400 },

  // Realm 5
  { name: 'Kỳ Viện Trưởng', title: 'Trưởng viện kỳ đao', diff: 'hard', elo: 2450 },
  { name: 'Thái Hư Đạo Nhân', title: 'Hư vô cảnh giới', diff: 'hard', elo: 2500 },
  { name: 'Vô Cực Sư Phụ', title: 'Thế cờ vô cực', diff: 'grandmaster', elo: 2550 },
  { name: 'Thiên Địa Kỳ Ma', title: 'Ma đạo biến hóa', diff: 'grandmaster', elo: 2600 },
  { name: 'Ngũ Hành Tôn Giả', title: 'Khắc chế tương sinh', diff: 'grandmaster', elo: 2650 },
  { name: 'Càn Khôn Kỳ Tướng', title: 'Xoay vần càn khôn', diff: 'grandmaster', elo: 2700 },
  { name: 'Bất Bại Kỳ Vương', title: 'Hàng trăm năm bất bại', diff: 'grandmaster', elo: 2750 },
  { name: 'Huyền Thoại Bất Diệt', title: 'Kỳ nghệ tối thượng', diff: 'grandmaster', elo: 2800 },
  { name: 'Thần Toán Tử', title: 'Tính trước 20 nước', diff: 'grandmaster', elo: 2850 },
  { name: 'Kỳ Thánh Thần Sầu', title: 'Đại sư tối cao vũ trụ', diff: 'grandmaster', elo: 2999 },
];

export const ALL_CAMPAIGN_STAGES: CampaignStage[] = Array.from({ length: 50 }, (_, i) => {
  const stageNum = i + 1;
  const realmId = Math.floor(i / 10) + 1;
  const realm = CAMPAIGN_REALMS[realmId - 1];
  const opp = OPPONENT_NAMES[i];

  return {
    id: stageNum,
    realmId,
    realmName: realm.name,
    stageNumber: stageNum,
    title: `Ải ${stageNum}: ${opp.name}`,
    description: `Đối đầu với cao thủ ${opp.name} (${opp.title}). Hạ gục đối thủ bằng chiến thuật thông minh.`,
    opponent: {
      id: `ai_stage_${stageNum}`,
      name: opp.name,
      title: opp.title,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=CaroAI_${stageNum}&backgroundColor=0f172a`,
      elo: opp.elo,
      difficulty: opp.diff as any,
      isAi: true,
      country: 'VN',
    },
    difficulty: opp.diff as any,
    timeLimitSec: 45,
    targetStars: {
      threeStarsTurns: Math.max(12, 28 - Math.floor(stageNum / 3)),
      twoStarsTurns: Math.max(18, 40 - Math.floor(stageNum / 3)),
    },
    rewardCoins: 50 + stageNum * 15,
    rewardXp: 30 + stageNum * 10,
    rewardGems: stageNum % 10 === 0 ? 5 : undefined,
  };
});
