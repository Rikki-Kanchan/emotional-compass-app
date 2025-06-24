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
    { name: "悟りEnlightenment", value: 1000, emoji: "🧘" },
    { name: "純粋意識 Pure awareness ", value: 700, emoji: "✨" },
    { name: "平和 Peace", value: 600, emoji: "🕊️" },
    { name: "心からの喜び Joy", value: 540, emoji: "😁" },
    { name: "愛 Love", value: 500, emoji: "💖" },
    { name: "情熱 Passion", value: 450, emoji: "🎨" },
    { name: "理性 Reason", value: 400, emoji: "🧠" },
    { name: "受容 Acceptance", value: 350, emoji: "🤗" },
    { name: "楽しみ Pleasure", value: 330, emoji: "😊" },
    { name: "意欲 Willingness", value: 310, emoji: "👍" },
    { name: "ポジティブな期待 Positive Belief", value: 280, emoji: "🤩" },
    { name: "楽観 Optimism", value: 270, emoji: "😌" },
    { name: "中立 Neutrality", value: 250, emoji: "😐" },
    { name: "勇気 Courage", value: 200, emoji: "💪" },
    { name: "希望 Hopefulness", value: 190, emoji: "🙏" },
    { name: "プライド Pride", value: 175, emoji: "😎" },
    { name: "満足 Contentment", value: 160, emoji: "🙂" },
    { name: "怒り Anger", value: 150, emoji: "😡" },
    { name: "いらだち Irritation", value: 140, emoji: "😤" },
    { name: "欲望 Desire", value: 125, emoji: "😍" },
    { name: "恐怖 Fear", value: 100, emoji: "😨" },
    { name: "不安 Anxiety ", value: 95, emoji: "😰" },
    { name: "心配Worry", value: 90, emoji: "😟" },
    { name: "後悔 Regret", value: 80, emoji: "😥" },
    { name: "深い悲しみ Grief", value: 75, emoji: "😢" },
    { name: "悲観 Pessimism", value: 65, emoji: "😞" },
    { name: "見下し Condescension", value: 60, emoji: "😒" },
    { name: "無気力 Apathy", value: 50, emoji: "😑" },
    { name: "憎しみ Hatred", value: 45, emoji: "😠" },
    { name: "罪悪感 Guilt", value: 30, emoji: "😔" },
    { name: "復讐心 Revenga", value: 25, emoji: "👿" },
    { name: "恥 Shame", value: 20, emoji: "😳" }
].sort((a, b) => b.value - a.value); // valueの高い順に並び替え


function App() {
  const [view, setView] = useState('logging');
  const [theme, setTheme] = useState('dark');
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setUserId(user.uid); } else { signInAnonymously(auth).catch((error) => console.error("匿名認証エラー:", error)); }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { document.documentElement.className = theme; }, [theme]);
  const toggleTheme = () => { setTheme(current => (current === 'dark' ? 'light' : 'dark')); };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="animate-spin h-10 w-10 text-cyan-400" />
        <p className="ml-4 text-lg">宇宙船システム起動中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased">
      <div id="stars-container">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      <div id="root-container">
        
        {/* ↓↓↓ ここからがヘッダーの修正部分 ↓↓↓ */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-lg">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <GitGraph className="h-8 w-8 text-cyan-400" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">Emotional Compass</h1>
            </div>
            <div className="flex items-center space-x-2 p-1 bg-slate-800/80 rounded-lg border border-slate-700">
              <Button variant="ghost" size="icon" onClick={() => setView('logging')} className={`transition-colors rounded-md ${view === 'logging' ? 'text-cyan-400 bg-slate-700' : 'text-slate-400 hover:text-slate-50'}`}>
                <Home />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setView('graph')} className={`transition-colors rounded-md ${view === 'graph' ? 'text-cyan-400 bg-slate-700' : 'text-slate-400 hover:text-slate-50'}`}>
                <BarChart2 />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-400 hover:text-slate-50 rounded-md">
                {theme === 'dark' ? <Sun /> : <Moon />}
              </Button>
            </div>
          </div>
        </header>
        {/* ↑↑↑ ここまでがヘッダーの修正部分 ↑↑↑ */}

        <div className="container mx-auto px-4 py-8">
          <main>
            {view === 'logging' ? ( <EmotionLoggingScreen setView={setView} userId={userId} /> ) : ( <EmotionGraphScreen userId={userId} setView={setView}/> )}
          </main>
          <footer className="text-center mt-12 text-sm text-slate-500">
            <p>&copy; 2025 Emotional Compass. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

// ... （以下、EmotionLoggingScreen と EmotionGraphScreen コンポーネントが続きます）

function EmotionLoggingScreen({ setView, userId }) {
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [memo, setMemo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isJustRecorded, setIsJustRecorded] = useState(false);

    const handleSubmit = async () => {
        if (!selectedEmotion || !userId) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, `users/${userId}/emotions`), {
                ...selectedEmotion,
                memo: memo,
                timestamp: serverTimestamp()
            });
            setIsJustRecorded(true);
            setTimeout(() => {
                setView('graph');
            }, 2000);
        } catch (error) {
            console.error("記録保存エラー: ", error);
            setIsSubmitting(false);
        }
    };

    return (
        // ↓↓↓ ここに rounded-2xl を追加し、背景を bg-slate-900/50 に変更しました！
        <Card className="rounded-2xl p-6 bg-slate-900/10 border border-slate-700 backdrop-blur-sm shadow-2xl shadow-black/30">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-cyan-400">
                    <Home className="h-6 w-6 text-cyan-400" />
                    今日の航路記録
                </CardTitle>
                <CardDescription className="text-slate-400 pl-8 pt-1">現在の心の状態を選択し、記録しましょう。</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-6">
                <div className="mb-6">
                    <h3 className="mb-4 font-semibold text-slate-300">感情を選択してください:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {emotions.map((emotion) => (
                            <Button
                                key={emotion.name}
                                variant="outline"
                                onClick={() => setSelectedEmotion(emotion)}
                                className={`h-auto text-left justify-start p-3 transition-all duration-300 ease-in-out group rounded-lg 
                                    shadow-lg shadow-black/20
                                    border border-slate-700 bg-slate-800 hover:border-cyan-500/50 hover:bg-slate-700/50 text-slate-300
                                    ${selectedEmotion?.name === emotion.name
                                        ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-400 shadow-[0_0_25px_-5px] shadow-cyan-500/70'
                                        : 'hover:shadow-cyan-500/10'
                                    }`}
                            >
                                <span className="text-2xl mr-3 transition-transform duration-200 group-hover:scale-110">{emotion.emoji}</span>
                                <div><p className="font-semibold">{emotion.name}</p></div>
                            </Button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="mb-2 font-semibold text-slate-300">メモ (任意):</h3>
                    <Textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="今の気持ちや出来事を記録しましょう..."
                        className="w-full bg-slate-800/80 border-slate-700 focus:ring-cyan-500 text-slate-50 rounded-lg"
                    />
                </div>
            </CardContent>
            <CardFooter className="p-0 mt-6">
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !selectedEmotion || isJustRecorded} 
                    className={`w-full text-white font-bold rounded-lg transition-colors duration-300
                        ${isJustRecorded 
                            ? 'bg-green-500' 
                            : 'bg-cyan-600 hover:bg-cyan-700'
                        } 
                        disabled:bg-slate-600 disabled:opacity-70`}
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 
                     isJustRecorded ? '感情を記録しました！' : 'このコンパスを記録する'}
                </Button>
            </CardFooter>
        </Card>
    );
}


function EmotionGraphScreen({ userId, setView }) { // setView を受け取るように変更
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(30); // 7, 30, Infinity
    
    // --- AI機能用の新しい「状態」を追加 ---
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState("");
    // ------------------------------------

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        const q = query(collection(db, `users/${userId}/emotions`), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const now = new Date();
            const filteredData = querySnapshot.docs.map(doc => {
                const docData = doc.data();
                return { ...docData, timestamp: docData.timestamp?.toDate() };
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

    // --- AI分析ボタンが押された時の処理を追加 ---
    const handleAiAnalysis = async () => {
        setIsAiLoading(true);
        setAiFeedback(""); 

        // 今はまだ本物のAIには接続せず、AIが考えている「フリ」をします
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒待つ

        const dummyFeedback = `Rikkiさん、こんにちは。過去${timeRange === Infinity ? '全期間' : timeRange + '日間'}の航路記録を拝見しました。\n全体的に「勇気」や「意欲」といったポジティブな感情が多く記録されていますね。素晴らしいです。\nただ、数日前に少しだけ「心配」の感情が見られますね。何か新しい挑戦があったのでしょうか。\nあなたの航海が、いつも素晴らしい光に満ちたものであることを、私はいつも願っています。`;
        setAiFeedback(dummyFeedback);
        setIsAiLoading(false);
    };
    // ------------------------------------
    
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
        // <> と </> で全体を囲む
        <>
            <Card className="bg-slate-900/70 border border-slate-700 backdrop-blur-sm shadow-2xl shadow-black/30 mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-50"><BarChart2 className="h-6 w-6 text-cyan-400" />感情の軌跡チャート</CardTitle>
                    <CardDescription className="text-slate-400 pl-8">記録された感情の経過をグラフで確認します。</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center space-x-2 mb-4">
                         {[7, 30, Infinity].map(range => (
                            <Button key={range} onClick={() => setTimeRange(range)} variant={timeRange === range ? 'default' : 'outline'}
                              className={`rounded-full ${timeRange === range ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 text-slate-300'}`}>
                                {range === Infinity ? '全期間' : `過去${range}日間`}
                            </Button>
                        ))}
                    </div>
                    {data.length > 1 ? (
                         <div className="h-96 w-full mt-6">
                            <ResponsiveContainer>
                                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#475569" />
                                    <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })} stroke="#94a3b8" angle={-30} textAnchor="end" height={50} />
                                    <YAxis domain={[0, 1000]} stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                                    <Line type="monotone" dataKey="value" name="感情レベル" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4, fill: '#22d3ee' }} activeDot={{ r: 8, className: 'stroke-cyan-200' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400">
                            <p>まだ表示できるデータが十分にありません。</p>
                            <p className="text-sm text-slate-500">2件以上の記録でグラフが表示されます。</p>
                            <Button onClick={() => setView('logging')} className="mt-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg">記録画面へ</Button>
                        </div>
                    )}
                </CardContent>
                {/* --- AI分析ボタンを追加 --- */}
                <CardFooter className="flex-col items-start gap-4">
                    <Button onClick={handleAiAnalysis} disabled={isAiLoading || data.length < 2} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white font-bold rounded-lg">
                        {isAiLoading ? <Loader2 className="animate-spin" /> : <> <Bot className="mr-2 h-4 w-4" /> AIに航路を分析してもらう </>}
                    </Button>
                </CardFooter>
                 {/* ---------------------- */}
            </Card>

            {/* --- AIの思考中＆フィードバック表示エリアを追加 --- */}
            {isAiLoading && (
                <div className="text-center text-slate-400 my-4 flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    AIコンパニオンがあなたの航路を分析中です...
                </div>
            )}
            
            {aiFeedback && (
                <Card className="bg-slate-800/50 border border-indigo-500/50 backdrop-blur-lg shadow-2xl shadow-black/30 animate-in fade-in-50">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <Bot className="h-8 w-8 text-indigo-400" />
                        <div>
                            <CardTitle className="text-indigo-400">AIコンパニオンからの通信</CardTitle>
                            <CardDescription className="text-slate-400">あなたの航路を分析しました。</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {aiFeedback}
                    </CardContent>
                </Card>
            )}
            {/* ------------------------------------ */}
        </>
    );
}
export default App;