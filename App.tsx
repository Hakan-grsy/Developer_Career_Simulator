import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Platform, Modal, ScrollView } from 'react-native';

type Inventory = {
  keyboard: boolean;
  headset: boolean;
  monitor: boolean;
};

export default function App() {
  const [xp, setXp] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [money, setMoney] = useState(0);
  const [inventory, setInventory] = useState<Inventory>({ keyboard: false, headset: false, monitor: false });
  const [copilotHits, setCopilotHits] = useState(0);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'event' | '' }>({ text: '', type: '' });
  const messageTimeout = useRef<NodeJS.Timeout | null>(null);

  const isCopilotActive = copilotHits > 0;

  const displayMessage = (text: string, type: 'success' | 'error' | 'event') => {
    setMessage({ text, type });
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3500);
  };

  const levelData = useMemo(() => {
    if (xp >= 8000) return { title: 'CTO', xpGain: 100, moneyGain: 150, baseEnergyCost: 5 };
    if (xp >= 3500) return { title: 'Lead Developer', xpGain: 70, moneyGain: 80, baseEnergyCost: 5 };
    if (xp >= 1500) return { title: 'Senior', xpGain: 40, moneyGain: 40, baseEnergyCost: 10 };
    if (xp >= 600) return { title: 'Mid-Level', xpGain: 25, moneyGain: 20, baseEnergyCost: 15 };
    if (xp >= 200) return { title: 'Junior', xpGain: 15, moneyGain: 10, baseEnergyCost: 20 };
    return { title: 'Stajyer', xpGain: 10, moneyGain: 5, baseEnergyCost: 25 };
  }, [xp]);

  const level = levelData.title;
  let currentXpGain = levelData.xpGain;
  let currentMoneyGain = levelData.moneyGain;
  let energyCost = levelData.baseEnergyCost;

  if (inventory.keyboard) currentXpGain += 5;
  if (isCopilotActive) currentXpGain *= 2; 
  if (inventory.headset) energyCost -= 5;
  if (inventory.monitor) currentMoneyGain = Math.floor(currentMoneyGain * 1.2);

  // Güvenlik Kilidi (Cap): Enerji tüketimi hiçbir koşulda 1'in altına düşemez.
  energyCost = Math.max(1, energyCost);

  const freelanceMoneyGain = inventory.monitor ? Math.floor(150 * 1.2) : 150;

  // Burnout Effect
  useEffect(() => {
    if (energy <= 0) {
      if (money < 5) {
        const msg = 'Gerçek Burnout! 💥 Enerjin 0 ve kahve alacak paran bile kalmadı. Oyun tamamen sıfırlanıyor.';
        if (Platform.OS === 'web') {
          window.alert(msg);
          fullReset();
        } else {
          Alert.alert('Gerçek Burnout!', msg, [{ text: 'Baştan Başla', onPress: fullReset }], { cancelable: false });
        }
      } else {
        const msg = 'Tükendin! Hastaneye kaldırıldın. Tedavi masrafı -$20 ödendi ve enerjin 30\'a toplandı.';
        if (Platform.OS === 'web') {
          window.alert(msg);
          recoverFromBurnout();
        } else {
          Alert.alert('Burnout! 💥', msg, [{ text: 'Tamam', onPress: recoverFromBurnout }], { cancelable: false });
        }
      }
    }
  }, [energy, money]);

  const recoverFromBurnout = () => {
    setEnergy(30);
    setMoney(prev => Math.max(0, prev - 20));
  };

  const fullReset = () => {
    setXp(0);
    setEnergy(100);
    setMoney(0);
    setInventory({ keyboard: false, headset: false, monitor: false });
    setCopilotHits(0);
    setMessage({ text: '', type: '' });
  };

  const executeRandomEvent = () => {
    let dynamicEnergyPenalty = 30;
    if (level === 'Mid-Level') dynamicEnergyPenalty = 45;
    else if (level === 'Senior' || level === 'Lead Developer' || level === 'CTO') dynamicEnergyPenalty = 60;

    const penaltyPercent = 0.15 + Math.random() * 0.10;
    const dynamicMoneyPenalty = Math.max(50, Math.floor(money * penaltyPercent));

    const dynamicXpPenalty = Math.max(1, Math.floor(xp * 0.05));

    const events = [
      { text: 'Turkcell GNÇYTNK etkinliğinde harika bir network yaptın! (+100 XP, +$50)', xpGain: 100, moneyGain: 50, energyGain: 0, type: 'event' as const },
      { text: 'Code Genius hackathonunu kazandın! (+150 XP, +$100)', xpGain: 150, moneyGain: 100, energyGain: 0, type: 'event' as const },
      { text: `Production veritabanını sildin! Bütün gece hatayı düzelttin. (-${dynamicEnergyPenalty} ⚡, -$${dynamicMoneyPenalty})`, xpGain: 0, moneyGain: -dynamicMoneyPenalty, energyGain: -dynamicEnergyPenalty, type: 'error' as const },
      { text: `Tükenmişlik Sendromu Başlangıcı: Çok mesai yaptın. (-${dynamicXpPenalty} XP, -${dynamicEnergyPenalty} ⚡)`, xpGain: -dynamicXpPenalty, moneyGain: 0, energyGain: -dynamicEnergyPenalty, type: 'error' as const }
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    
    setXp(prev => Math.max(0, prev + event.xpGain));
    setMoney(prev => Math.max(0, prev + event.moneyGain));
    setEnergy(prev => prev + event.energyGain);
    
    displayMessage(`Olay: ${event.text}`, event.type);
    
    if (Platform.OS === 'web') {
      window.alert('Rastgele Olay!\n\n' + event.text);
    } else {
      Alert.alert('Rastgele Olay! 🎲', event.text);
    }
  };

  const handleWriteCode = () => {
    setXp(prev => prev + currentXpGain);
    setMoney(prev => prev + currentMoneyGain);
    setEnergy(prev => prev - energyCost);

    if (isCopilotActive) {
      setCopilotHits(prev => prev - 1);
    }
    
    if (Math.random() < 0.10) {
      setTimeout(() => executeRandomEvent(), 100);
    }
  };

  const handleDrinkCoffee = () => {
    if (money >= 5) {
      setMoney(prev => prev - 5);
      setEnergy(prev => Math.min(100, prev + 30));
    } else {
      displayMessage('Kahve alacak paran yok ($5)!', 'error');
    }
  };

  const handleFreelance = () => {
    if (energy >= 80) {
      setEnergy(prev => prev - 80);
      setXp(prev => prev + 200);
      setMoney(prev => prev + freelanceMoneyGain);
      displayMessage(`Bionluk işi teslim edildi! (+200 XP, +$${freelanceMoneyGain})`, 'success');
    } else {
      displayMessage('Bu iş için en az 80 enerji lazım!', 'error');
    }
  };

  const handleStackOverflow = () => {
    if (Math.random() >= 0.5) {
      setXp(prev => prev + 30);
      setEnergy(prev => prev - 10);
      displayMessage('Şanslısın! Çözümü kopyaladın (+30 XP, -10 ⚡)', 'success');
    } else {
      setEnergy(prev => prev - 25);
      displayMessage('Yanlış cevap! Kafan karıştı (-25 ⚡)', 'error');
    }
  };

  const buyItem = (item: keyof Inventory, price: number) => {
    if (inventory[item]) {
      displayMessage('Bu kalıcı eşyaya zaten sahipsin!', 'error');
      return;
    }
    if (money >= price) {
      setMoney(prev => prev - price);
      setInventory(prev => ({ ...prev, [item]: true }));
      displayMessage('Satın alma başarılı!', 'success');
    } else {
      displayMessage(`Yeterli paran yok! ($${price} gerekiyor)`, 'error');
    }
  };

  const buyConsumable = (type: 'energyDrink' | 'copilot' | 'tubitak') => {
    if (type === 'energyDrink') {
      if (money >= 50) {
        setMoney(prev => prev - 50);
        setEnergy(100);
        displayMessage('Full enerji! 🚀', 'success');
      } else displayMessage('Yetersiz bakiye! ($50)', 'error');
    } else if (type === 'copilot') {
      if (money >= 200) {
        setMoney(prev => prev - 200);
        setCopilotHits(10);
        displayMessage('AI Copilot Aktif! (10 Tıklama, 2x XP)', 'success');
      } else displayMessage('Yetersiz bakiye! ($200)', 'error');
    } else if (type === 'tubitak') {
      if (money >= 5000) {
        setMoney(prev => prev - 5000);
        setIsStoreOpen(false);
        setTimeout(() => {
          const msg = 'Tebrikler! TÜBİTAK 2209-A projesini başarıyla sundun ve kendi şirketini kurmak için dev bir hibe aldın. Oyunu BAŞARIYLA KAZANDIN! 🏆';
          if (Platform.OS === 'web') {
            window.alert(msg);
            fullReset();
          } else {
            Alert.alert('GÖREV TAMAMLANDI!', msg, [{ text: 'Yeniden Başla', onPress: fullReset }], { cancelable: false });
          }
        }, 500);
      } else displayMessage('Henüz bir MVP kuracak kadar paran yok! ($5000)', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Developer Tycoon 💻</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Seviye</Text>
            <Text style={styles.statValue}>{level}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Para</Text>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>${money}</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={styles.statValue}>{xp}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Enerji</Text>
            <Text style={styles.statValue}>⚡ {energy}</Text>
          </View>
        </View>
      </View>

      {message.text !== '' && (
        <View style={styles.messageBox}>
          <Text style={[
            styles.messageText, 
            message.type === 'success' ? styles.messageSuccess : 
            message.type === 'error' ? styles.messageError : styles.messageEvent
          ]}>
            {message.text}
          </Text>
        </View>
      )}

      {isCopilotActive && (
        <View style={styles.copilotBox}>
          <Text style={styles.copilotText}>🤖 AI Copilot Aktif : {copilotHits} Eylem Kaldı (2x XP)</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.actionContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.button, styles.codeButton, energy <= 0 && styles.disabledButton]} 
          onPress={handleWriteCode}
          disabled={energy <= 0}
        >
          <Text style={styles.buttonText}>
            Kod Yaz (+{currentXpGain} XP, +${currentMoneyGain}, -{energyCost} ⚡)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.freelanceButton, energy < 80 && styles.disabledButton]} 
          onPress={handleFreelance}
          disabled={energy < 80}
        >
          <Text style={styles.buttonText}>
            Bionluk İşi Al (+200 XP, +${freelanceMoneyGain}, -80 ⚡)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.coffeeButton, money < 5 && styles.disabledButton]} 
          onPress={handleDrinkCoffee}
          disabled={money < 5}
        >
          <Text style={styles.buttonText}>Kahve İç (+30 ⚡, -$5)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.stackOverflowButton, energy <= 0 && styles.disabledButton]} 
          onPress={handleStackOverflow}
          disabled={energy <= 0}
        >
          <Text style={styles.buttonText}>Stack Overflow (Rastgele ⚡/XP)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.storeOpenerButton]} 
          onPress={() => setIsStoreOpen(true)}
        >
          <Text style={[styles.buttonText, { color: '#121212' }]}>🛒 Mağazayı Aç</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Store Modal */}
      <Modal visible={isStoreOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Teknoloji Mağazası 🛒</Text>
              <Text style={styles.modalSubtitle}>Bakiye: <Text style={{ color: '#FFD700' }}>${money}</Text></Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              
              <Text style={styles.storeSectionTitle}>Kalıcı Eşyalar</Text>
              <View style={styles.storeItem}>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemName}>Mekanik Klavye</Text>
                  <Text style={styles.storeItemDesc}>Her Kod Yaz eylemi +5 XP verir.</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.buyButton, inventory.keyboard && styles.boughtButton]} 
                  onPress={() => buyItem('keyboard', 150)}
                >
                  <Text style={styles.buyButtonText}>{inventory.keyboard ? 'Alındı' : '$150'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.storeItem}>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemName}>Arctis Nova 5 Kulaklık</Text>
                  <Text style={styles.storeItemDesc}>Odaklanmayı artırır (Enerji tüketimi -5 ⚡).</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.buyButton, inventory.headset && styles.boughtButton]} 
                  onPress={() => buyItem('headset', 400)}
                >
                  <Text style={styles.buyButtonText}>{inventory.headset ? 'Alındı' : '$400'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.storeItem}>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemName}>Çift Monitör</Text>
                  <Text style={styles.storeItemDesc}>Kazanılan parayı %20 artırır.</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.buyButton, inventory.monitor && styles.boughtButton]} 
                  onPress={() => buyItem('monitor', 800)}
                >
                  <Text style={styles.buyButtonText}>{inventory.monitor ? 'Alındı' : '$800'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.storeSectionTitle}>Tüketilebilir (Sürekli)</Text>
              <View style={styles.storeItem}>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemName}>Premium Enerji İçeceği</Text>
                  <Text style={styles.storeItemDesc}>Anında enerji state'ini Full (100) yapar.</Text>
                </View>
                <TouchableOpacity 
                  style={styles.buyButton} 
                  onPress={() => buyConsumable('energyDrink')}
                >
                  <Text style={styles.buyButtonText}>$50</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.storeItem}>
                <View style={styles.storeItemInfo}>
                  <Text style={styles.storeItemName}>AI Copilot Lisansı</Text>
                  <Text style={styles.storeItemDesc}>10 kod eylemi boyunca harika odak (+2x XP).</Text>
                </View>
                <TouchableOpacity 
                  style={styles.buyButton} 
                  onPress={() => buyConsumable('copilot')}
                >
                  <Text style={styles.buyButtonText}>$200</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.storeSectionTitle, { color: '#00E676', marginTop: 20 }]}>Oyun Sonu (Büyük Final)</Text>
              <TouchableOpacity 
                style={styles.winGameButton} 
                onPress={() => buyConsumable('tubitak')}
              >
                <Text style={styles.winGameButtonText}>TÜBİTAK 2209-A FONLA ($5000)</Text>
              </TouchableOpacity>

            </ScrollView>

            <TouchableOpacity 
              style={styles.closeStoreButton} 
              onPress={() => setIsStoreOpen(false)}
            >
              <Text style={styles.closeStoreText}>Kapat</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00E676',
    letterSpacing: 1,
  },
  statsContainer: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    width: '45%',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  messageBox: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#252525',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderColor: '#555',
  },
  messageText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageSuccess: { color: '#00E676' },
  messageError: { color: '#FF1744' },
  messageEvent: { color: '#FFD700' },
  
  copilotBox: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(3, 169, 244, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#03A9F4',
    alignItems: 'center',
  },
  copilotText: {
    color: '#03A9F4',
    fontWeight: 'bold',
    fontSize: 14,
  },

  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  codeButton: { backgroundColor: '#2962FF' },
  freelanceButton: { backgroundColor: '#6200EA' },
  coffeeButton: { backgroundColor: '#FF6D00' },
  stackOverflowButton: { backgroundColor: '#03A9F4' },
  storeOpenerButton: { backgroundColor: '#FFFFFF', marginTop: 10 },
  disabledButton: { backgroundColor: '#424242', opacity: 0.7 },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: '90%',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    fontWeight: '600',
  },
  storeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  storeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  storeItemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  storeItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  storeItemDesc: {
    fontSize: 12,
    color: '#AAA',
  },
  buyButton: {
    backgroundColor: '#00E676',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  boughtButton: {
    backgroundColor: '#555',
  },
  buyButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  closeStoreButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#FF1744',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeStoreText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  winGameButton: {
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  winGameButtonText: {
    color: '#121212',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  }
});
