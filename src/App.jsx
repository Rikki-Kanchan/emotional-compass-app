import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Sun, Moon, Home, BarChart2, Bot, Send, Loader2, ServerCrash, GitGraph } from 'lucide-react';

// あなたのFirebaseプロジェクトの設定情報をここに貼り付けてください
const firebaseConfig = {
  apiKey: "AIzaSyCrbRIGZoDdu8xsKiie68zxeRudn7f3ul8",
  authDomain: "emotional-compass-bda2d.firebaseapp.com",
  projectId: "emotional-compass-bda2d",
  storageBucket: "emotional-compass-bda2d.appspot.com",
  messagingSenderId: "1036566138414",
  appId: "1:1036566138414:web:5cb37538d1afe188a4d9bf",
  measurementId: "G-LPK9Z6LQ5R"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// UIコンポーネント (shadcn/uiからインポートされることを想定)
// もしshadcn/uiのコンポーネントがなければ、一時的に通常のbuttonやdivで代用します
const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
const Card = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardHeader = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardTitle = ({ children, ...props }) => <h2 {...props}>{children}</h2>;
const CardDescription = ({ children, ...props }) => <p {...props}>{children}</p>;
const CardContent = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardFooter = ({ children, ...props }) => <div {...props}>{children}</div>;
const Textarea = (props) => <textarea {...props} />;


// ホーキンズ博士の意識のスケールに基づく感情リスト（完全版）
const emotions = [
    { name: "悟り", value: 1000, emoji: "🧘" },
    { name: "純粋意識", value: 700, emoji: "✨" },
    { name: "平和", value: 600, emoji: "🕊️" },
    { name: "喜び", value: 540, emoji: "😁" },
    { name: "愛", value: 500, emoji: "💖" },
    { name: "創造意識", value: 450, emoji: "🎨" },
    { name: "理性", value: 400, emoji: "🧠" },
    { name: "受容", value: 350, emoji: "🤗" },
    { name: "楽しみ", value: 330, emoji: "😊" },
    { name: "わかります", value: 320, emoji: "🤝" },
    { name: "意欲", value: 310, emoji: "👍" },
    { name: "ポジティブな期待", value: 280, emoji: "🤩" },
    { name: "楽観", value: 270, emoji: "😌" },
    { name: "中立", value: 250, emoji: "😐" },
    { name: "勇気", value: 200, emoji: "💪" },
    { name: "希望", value: 190, emoji: "🙏" },
    { name: "プライド", value: 175, emoji: "😎" },
    { name: "満足", value: 160, emoji: "🙂" },
    { name: "怒り", value: 150, emoji: "😡" },
    { name: "いらだち", value: 140, emoji: "😤" },
    { name: "欲望", value: 125, emoji: "😍" },
    { name: "恐怖", value: 100, emoji: "😨" },
    { name: "不安", value: 95, emoji: "😰" },
    { name: "心配", value: 90, emoji: "😟" },
    { name: "後悔", value: 80, emoji: "😥" },
    { name: "深い悲しみ", value: 75, emoji: "😢" },
    { name: "悲観", value: 65, emoji: "😞" },
    { name: "見下し", value: 60, emoji: "😒" },
    { name: "無気力", value: 50, emoji: "😑" },
    { name: "憎しみ", value: 45, emoji: "😠" },
    { name: "罪悪感", value: 30, emoji: "😔" },
    { name: "復讐心", value: 25, emoji: "👿" },
    { name: "恥", value: 20, emoji: "😳" }
].sort((a, b) => b.value - a.value); // valueの高い順に並び替え


function App() {
  const [view, setView] = useState('logging'); // 'logging' or 'graph'
  const [theme, setTheme] = useState('dark');
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("匿名認証に失敗しました:", error);
        });
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.className = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <Loader2 className="animate-spin h-10 w-10" />
        <p className="ml-4 text-lg">宇宙船のシステムを起動しています...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans antialiased">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
             <GitGraph className="h-8 w-8 text-cyan-400" />
             <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Emotional Compass</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setView('logging')} className={view === 'logging' ? 'text-cyan-400' : ''}>
              <Home />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setView('graph')} className={view === 'graph' ? 'text-cyan-400' : ''}>
              <BarChart2 />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
          </div>
        </header>

        <main>
          {view === 'logging' ? (
            <EmotionLoggingScreen setView={setView} userId={userId} />
          ) : (
            <EmotionGraphScreen userId={userId} />
          )}
        </main>

        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>&copy; 2025 Emotional Compass. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

// ... （以下、EmotionLoggingScreen と EmotionGraphScreen コンポーネントが続きます）

function EmotionLoggingScreen({ setView, userId }) {
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [memo, setMemo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedEmotion || !userId) {
            alert('感情を選択してください。');
            return;
        }
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, `users/${userId}/emotions`), {
                ...selectedEmotion,
                memo: memo,
                timestamp: serverTimestamp()
            });
            setSelectedEmotion(null);
            setMemo('');
            setView('graph'); // 記録後、グラフ画面に自動遷移
        } catch (error) {
            console.error("記録の保存に失敗しました: ", error);
            alert('記録の保存に失敗しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-slate-800/50 dark:bg-slate-800/90 border border-slate-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold">今日の航路記録</CardTitle>
                <CardDescription>現在の心の状態を選択し、記録しましょう。</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <h3 className="mb-4 font-semibold">感情を選択してください:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {emotions.map((emotion) => (
                            <Button
                                key={emotion.name}
                                variant="outline"
                                onClick={() => setSelectedEmotion(emotion)}
                                className={`h-auto text-left justify-start p-3 transition-all duration-200 ease-in-out transform hover:-translate-y-1
                                    ${selectedEmotion?.name === emotion.name
                                        ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-400 bg-slate-700 shadow-[0_0_20px_4px] shadow-cyan-500/40'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            >
                                <span className="text-2xl mr-3">{emotion.emoji}</span>
                                <div>
                                    <p className="font-bold">{emotion.name}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="mb-2 font-semibold">メモ (任意):</h3>
                    <Textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="今の気持ちや出来事を記録しましょう..."
                        className="bg-slate-700 border-slate-600 focus:ring-cyan-500"
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedEmotion} className="w-full bg-cyan-600 hover:bg-cyan-700">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'このコンパスを記録する'}
                </Button>
            </CardFooter>
        </Card>
    );
}


function EmotionGraphScreen({ userId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(30); // 7, 30, Infinity

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        const q = query(collection(db, `users/${userId}/emotions`), orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const now = new Date();
            const filteredData = querySnapshot.docs.map(doc => {
                const docData = doc.data();
                return {
                    ...docData,
                    timestamp: docData.timestamp?.toDate() // FirestoreのTimestampをJSのDateに変換
                };
            }).filter(item => {
                if (!item.timestamp) return false;
                if (timeRange === Infinity) return true;
                const diffDays = (now - item.timestamp) / (1000 * 60 * 60 * 24);
                return diffDays <= timeRange;
            });

            setData(filteredData);
            setLoading(false);
        }, (err) => {
            console.error("データの取得に失敗しました: ", err);
            setError("データの取得に失敗しました。");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, timeRange]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg">
                    <p className="font-bold text-cyan-400">{`${data.timestamp.toLocaleString()}`}</p>
                    <p className="text-lg">{`${data.emoji} ${data.name}: ${data.value} pt`}</p>
                    {data.memo && <p className="mt-2 text-sm text-slate-400">{`メモ: ${data.memo}`}</p>}
                </div>
            );
        }
        return null;
    };


    if (loading) return <div className="text-center p-10"><Loader2 className="animate-spin inline-block h-8 w-8" /></div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <Card className="bg-slate-800/50 dark:bg-slate-800/90 border border-slate-700 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>感情の軌跡チャート</CardTitle>
                <CardDescription>記録された感情の経過をグラフで確認します。</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center space-x-2 mb-4">
                    <Button onClick={() => setTimeRange(7)} variant={timeRange === 7 ? 'default' : 'outline'}>過去7日間</Button>
                    <Button onClick={() => setTimeRange(30)} variant={timeRange === 30 ? 'default' : 'outline'}>過去30日間</Button>
                    <Button onClick={() => setTimeRange(Infinity)} variant={timeRange === Infinity ? 'default' : 'outline'}>全期間</Button>
                </div>

                {data.length > 0 ? (
                    <div className="h-96 w-full mt-6">
                        <ResponsiveContainer>
                            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(time) => new Date(time).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                                    stroke="#94a3b8"
                                />
                                <YAxis domain={[0, 1000]} stroke="#94a3b8" />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p>まだ表示できるデータがありません。</p>
                        <p className="text-sm text-slate-400">まずは今日の感情を記録してみましょう。</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default App;