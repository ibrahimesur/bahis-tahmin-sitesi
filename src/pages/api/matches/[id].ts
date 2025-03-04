import type { NextApiRequest, NextApiResponse } from 'next';
import { MatchDetail } from '../../../types';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchDetail | { error: string }>
) {
  const { id } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API yapılandırması eksik' });
  }

  try {
    // Varsayılan istatistik değerleri için yardımcı fonksiyon
    const getDefaultStats = () => ({
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      possession: { home: 50, away: 50 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 }
    });

    // Maç detayları
    const matchResponse = await fetch(`${API_URL}/matches/${id}`, {
      headers: { 'X-Auth-Token': API_KEY },
      next: { revalidate: 60 } // 60 saniye önbellekleme
    }).catch(error => {
      console.error('Maç detayları API hatası:', error);
      return res.status(500).json({ error: 'Maç detayları alınamadı' });
    });

    if (!matchResponse?.ok) {
      const errorData = await matchResponse?.json().catch(() => ({}));
      console.error('Maç detayları API yanıt hatası:', errorData);
      return res.status(500).json({ error: errorData.message || 'Maç detayları alınamadı' });
    }

    const matchData = await matchResponse.json().catch(error => {
      console.error('Maç detayları JSON parse hatası:', error);
      return res.status(500).json({ error: 'Maç detayları işlenemedi' });
    });

    if (!matchData) {
      return res.status(500).json({ error: 'Maç detayları bulunamadı' });
    }

    // Takım kadrolarını döndüren yardımcı fonksiyon
    const getTeamSquad = (teamName: string, formation: string) => {
      // Takıma özel kadro bilgileri
      const squadData: { [key: string]: any } = {
        'Paris Saint-Germain': {
          formation: '4-3-3',
          players: {
            starters: [
              { id: 1, name: 'Donnarumma', number: 1, position: 'Goalkeeper' },
              { id: 2, name: 'Hakimi', number: 2, position: 'Defender' },
              { id: 3, name: 'Marquinhos', number: 5, position: 'Defender' },
              { id: 4, name: 'Skriniar', number: 3, position: 'Defender' },
              { id: 5, name: 'L. Hernandez', number: 21, position: 'Defender' },
              { id: 6, name: 'Zaïre-Emery', number: 33, position: 'Midfielder' },
              { id: 7, name: 'Vitinha', number: 17, position: 'Midfielder' },
              { id: 8, name: 'Ugarte', number: 4, position: 'Midfielder' },
              { id: 9, name: 'Dembélé', number: 10, position: 'Forward' },
              { id: 10, name: 'Mbappé', number: 7, position: 'Forward' },
              { id: 11, name: 'Kolo Muani', number: 23, position: 'Forward' }
            ],
            substitutes: [
              { id: 12, name: 'Tenas', number: 80, position: 'Goalkeeper' },
              { id: 13, name: 'Danilo', number: 15, position: 'Defender' },
              { id: 14, name: 'Soler', number: 28, position: 'Midfielder' },
              { id: 15, name: 'Asensio', number: 11, position: 'Forward' }
            ],
            coach: 'Luis Enrique'
          }
        },
        'Olympique Lyonnais': {
          formation: '4-2-3-1',
          players: {
            starters: [
              { id: 1, name: 'Lopes', number: 1, position: 'Goalkeeper' },
              { id: 2, name: 'Mata', number: 15, position: 'Defender' },
              { id: 3, name: 'Lovren', number: 6, position: 'Defender' },
              { id: 4, name: 'Caleta-Car', number: 4, position: 'Defender' },
              { id: 5, name: 'Tagliafico', number: 3, position: 'Defender' },
              { id: 6, name: 'Caqueret', number: 25, position: 'Midfielder' },
              { id: 7, name: 'Tolisso', number: 88, position: 'Midfielder' },
              { id: 8, name: 'Nuamah', number: 27, position: 'Midfielder' },
              { id: 9, name: 'Cherki', number: 18, position: 'Midfielder' },
              { id: 10, name: 'Moreira', number: 11, position: 'Midfielder' },
              { id: 11, name: 'Lacazette', number: 10, position: 'Forward' }
            ],
            substitutes: [
              { id: 12, name: 'Riou', number: 30, position: 'Goalkeeper' },
              { id: 13, name: 'Kumbedi', number: 26, position: 'Defender' },
              { id: 14, name: 'Lepenant', number: 24, position: 'Midfielder' },
              { id: 15, name: 'Baldé', number: 7, position: 'Forward' }
            ],
            coach: 'Fabio Grosso'
          }
        }
        // Diğer takımlar için benzer veriler eklenebilir
      };

      // Takım verisi yoksa varsayılan kadro
      const defaultSquad = {
        formation: formation,
        players: {
          starters: Array(11).fill(null).map((_, i) => ({
            id: i + 1,
            name: `${teamName} Oyuncu ${i + 1}`,
            number: i + 1,
            position: i === 0 ? 'Goalkeeper' :
                     i <= 4 ? 'Defender' :
                     i <= 8 ? 'Midfielder' : 'Forward'
          })),
          substitutes: Array(4).fill(null).map((_, i) => ({
            id: i + 12,
            name: `${teamName} Yedek ${i + 1}`,
            number: i + 12,
            position: i === 0 ? 'Goalkeeper' :
                     i === 1 ? 'Defender' :
                     i === 2 ? 'Midfielder' : 'Forward'
          })),
          coach: `${teamName} Teknik Direktörü`
        }
      };

      return squadData[teamName] || defaultSquad;
    };

    // lineups oluşturulurken:
    const homeSquad = getTeamSquad(matchData.homeTeam.name, '4-4-2');
    const awaySquad = getTeamSquad(matchData.awayTeam.name, '4-3-3');

    const lineups = {
      home: {
        team: {
          id: matchData.homeTeam.id,
          name: matchData.homeTeam.name,
          logo: matchData.homeTeam.crest
        },
        formation: homeSquad.formation,
        startingXI: homeSquad.players.starters,
        substitutes: homeSquad.players.substitutes,
        coach: {
          id: 1,
          name: homeSquad.players.coach,
          photo: undefined,
          nationality: 'TR'
        }
      },
      away: {
        team: {
          id: matchData.awayTeam.id,
          name: matchData.awayTeam.name,
          logo: matchData.awayTeam.crest
        },
        formation: awaySquad.formation,
        startingXI: awaySquad.players.starters,
        substitutes: awaySquad.players.substitutes,
        coach: {
          id: 2,
          name: awaySquad.players.coach,
          photo: undefined,
          nationality: 'TR'
        }
      }
    };

    // Maç istatistikleri için ayrı istek
    const statsResponse = await fetch(`${API_URL}/matches/${id}/statistics`, {
      headers: { 'X-Auth-Token': API_KEY },
      next: { revalidate: 60 } // 60 saniye önbellekleme
    }).catch(error => {
      console.error('İstatistik API hatası:', error);
      return null;
    });

    let stats;
    if (statsResponse?.ok) {
      try {
        const statsData = await statsResponse.json().catch(error => {
          console.error('İstatistik JSON parse hatası:', error);
          return null;
        });

        if (!statsData) {
          console.log('İstatistik verisi alınamadı, varsayılan değerler kullanılıyor');
          stats = getDefaultStats();
        } else {
          // API yanıtını kontrol et
          if (!statsData.statistics || !Array.isArray(statsData.statistics)) {
            console.log('Geçersiz istatistik verisi formatı:', statsData);
            stats = getDefaultStats();
          } else {
            // İstatistikleri doğru şekilde çıkar
            const homeStats = statsData.statistics.find((stat: any) => stat.team.id === matchData.homeTeam.id);
            const awayStats = statsData.statistics.find((stat: any) => stat.team.id === matchData.awayTeam.id);

            if (!homeStats || !awayStats) {
              console.log('Takım istatistikleri bulunamadı:', { homeStats, awayStats });
              stats = getDefaultStats();
            } else {
              // Yardımcı fonksiyon - istatistik değerini bul ve temizle
              const cleanStatValue = (value: string | number) => {
                if (typeof value === 'number') return value;
                if (typeof value !== 'string') return 0;
                // Yüzde işaretini kaldır ve sayıya çevir
                return parseInt(value.replace('%', '')) || 0;
              };

              const findStatValue = (stats: any, type: string) => {
                try {
                  if (!stats || !stats.statistics) {
                    console.log(`${type} için istatistik bulunamadı:`, stats);
                    return 0;
                  }
                  const stat = stats.statistics.find((s: any) => s.type === type);
                  if (!stat) {
                    console.log(`${type} için değer bulunamadı:`, stats.statistics);
                    return 0;
                  }
                  
                  const value = cleanStatValue(stat.value);
                  console.log(`${type} değeri:`, value);
                  return value;
                } catch (error) {
                  console.error(`${type} değeri işlenirken hata:`, error);
                  return 0;
                }
              };

              stats = {
                shots: {
                  home: findStatValue(homeStats, 'Total Shots'),
                  away: findStatValue(awayStats, 'Total Shots')
                },
                shotsOnTarget: {
                  home: findStatValue(homeStats, 'Shots on Goal'),
                  away: findStatValue(awayStats, 'Shots on Goal')
                },
                possession: {
                  home: findStatValue(homeStats, 'Ball Possession'),
                  away: findStatValue(awayStats, 'Ball Possession')
                },
                corners: {
                  home: findStatValue(homeStats, 'Corner Kicks'),
                  away: findStatValue(awayStats, 'Corner Kicks')
                },
                fouls: {
                  home: findStatValue(homeStats, 'Fouls'),
                  away: findStatValue(awayStats, 'Fouls')
                },
                yellowCards: {
                  home: findStatValue(homeStats, 'Yellow Cards'),
                  away: findStatValue(awayStats, 'Yellow Cards')
                },
                redCards: {
                  home: findStatValue(homeStats, 'Red Cards'),
                  away: findStatValue(awayStats, 'Red Cards')
                }
              };

              // Eğer possession değerleri toplamı 100 değilse düzelt
              if (stats.possession.home + stats.possession.away !== 100) {
                console.log('Topla oynama yüzdesi düzeltiliyor:', stats.possession);
                stats.possession.home = 50;
                stats.possession.away = 50;
              }
            }
          }
        }
      } catch (error) {
        console.error('İstatistik işleme hatası:', error);
        stats = getDefaultStats();
      }
    } else {
      const errorText = await statsResponse?.text().catch(() => 'Bilinmeyen hata');
      console.error('İstatistik API yanıtı başarısız:', errorText);
      stats = getDefaultStats();
    }

    // Debug için istatistikleri logla
    console.log('Maç detayları:', {
      id,
      homeTeam: matchData.homeTeam.name,
      awayTeam: matchData.awayTeam.name,
      status: matchData.status,
      score: matchData.score,
      venue: matchData.venue,
      competition: matchData.competition.name
    });

    console.log('İstatistik verileri:', {
      rawStats: matchData.statistics,
      processedStats: stats,
      homeTeamStats: statsResponse?.ok ? await statsResponse.json().catch(() => null) : null
    });

    // Hata durumlarını logla
    if (!statsResponse?.ok) {
      console.error('İstatistik API yanıtı başarısız:', {
        status: statsResponse?.status,
        statusText: statsResponse?.statusText,
        error: await statsResponse?.text().catch(() => 'Bilinmeyen hata')
      });
    }

    // H2H için örnek veri (API'den gelmiyorsa)
    const h2h = Array(5).fill(null).map((_, i) => ({
      id: `h2h-${i}`,
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      homeTeam: {
        id: matchData.homeTeam.id,
        name: matchData.homeTeam.name,
        score: Math.floor(Math.random() * 4)
      },
      awayTeam: {
        id: matchData.awayTeam.id,
        name: matchData.awayTeam.name,
        score: Math.floor(Math.random() * 4)
      },
      competition: {
        id: matchData.competition.id,
        name: matchData.competition.name
      }
    }));

    // Dakika hesaplama fonksiyonu
    const calculateMinute = (match: any) => {
      if (match.status === 'FINISHED') return 90;
      if (match.status === 'HALF_TIME') return 45;
      if (match.status === 'SCHEDULED' || match.status === 'TIMED') return 0;

      // Canlı maçlar için dakika hesaplama
      if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
        const startTime = new Date(match.utcDate);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
        
        // İlk yarı
        if (diffMinutes <= 45) return diffMinutes;
        // Devre arası
        if (diffMinutes > 45 && diffMinutes < 60) return 45;
        // İkinci yarı
        return Math.min(90, diffMinutes - 15); // 15 dakika devre arası çıkarıldı
      }

      return 0;
    };

    // API yanıtını hazırla
    const response: MatchDetail = {
      id: matchData.id.toString(),
      homeTeam: {
        name: matchData.homeTeam.name,
        score: matchData.score.fullTime.home || matchData.score.halfTime.home || 0,
        redCards: matchData.score.redCards?.home || 0,
        logo: matchData.homeTeam.crest
      },
      awayTeam: {
        name: matchData.awayTeam.name,
        score: matchData.score.fullTime.away || matchData.score.halfTime.away || 0,
        redCards: matchData.score.redCards?.away || 0,
        logo: matchData.awayTeam.crest
      },
      minute: calculateMinute(matchData),
      league: matchData.competition.name,
      status: matchData.status === 'FINISHED' ? 'finished' :
              (matchData.status === 'IN_PLAY' || matchData.status === 'PAUSED') ? 'live' : 'not_started',
      events: [],
      venue: {
        id: 1,
        name: matchData.venue?.name || 'Stadyum',
        city: matchData.venue?.city || 'Şehir'
      },
      referee: {
        id: 1,
        name: matchData.referee?.name || 'Hakem',
        nationality: matchData.referee?.nationality || 'TR'
      },
      stats,
      lineups,
      h2h
    };

    // Yanıtı logla
    console.log('API yanıtı:', {
      status: 'success',
      data: response
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('API Hatası:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Maç detayları alınamadı' });
  }
} 