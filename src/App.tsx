import { useEffect, lazy, Suspense } from 'react';
import { IonApp, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';
import { homeOutline, timeOutline, statsChartOutline } from 'ionicons/icons';
import { useUserStore } from './useUserStore';
import splashIcon from './assets/splash-icon.png';

const Setup = lazy(() => import('./page-Setup'));
const Home = lazy(() => import('./page-Home'));
const History = lazy(() => import('./page-History'));
const Statistics = lazy(() => import('./page-Statistics'));
const Settings = lazy(() => import('./page-Settings'));

export const STATUS_BAR_HEIGHT = 0;

/* -- Capacitor native setup -- */
const setupNativeFeatures = async () => {
  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // Not on native platform, ignore
  }
};

/* -- Page loading fallback -- */
function PageLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 12,
      background: 'linear-gradient(160deg, #73d13d 0%, #389e0d 100%)',
    }}>
      <img
        src={splashIcon}
        alt="轻体记录"
        style={{ width: 96, height: 96, borderRadius: '50%' }}
      />
      <span style={{ color: '#fff', fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>轻体记录</span>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>加载中...</span>
    </div>
  );
}

/* -- Route guard: redirects to setup if no user -- */
function GuardedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useUserStore();
  if (!user) return <Redirect to="/setup" />;
  return <Component />;
}

/* -- Main App -- */
function App() {
  const { initializeDB, isInitialized } = useUserStore();

  useEffect(() => {
    initializeDB();
    setupNativeFeatures();

    // Safety timeout: if DB init hangs, force show the app after 10s
    const timeout = setTimeout(() => {
      const { isInitialized } = useUserStore.getState();
      if (!isInitialized) {
        console.warn('DB init timeout - forcing app to show');
        useUserStore.setState({ isInitialized: true });
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [initializeDB]);

  // Android back button handler
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    const setupBackButton = async () => {
      try {
        const listener = await CapApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapApp.exitApp();
          } else {
            window.history.back();
          }
        });
        removeListener = () => { listener.remove(); };
      } catch {
        // Not on native platform, ignore
      }
    };
    setupBackButton();
    return () => { removeListener?.(); };
  }, []);

  if (!isInitialized) {
    return <PageLoading />;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <Suspense fallback={<PageLoading />}>
          {/* Tab pages */}
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/" render={() => {
                const { user } = useUserStore.getState();
                if (!user) return <Redirect to="/setup" />;
                return <Home />;
              }} />
              <Route exact path="/history" component={History} />
              <Route exact path="/statistics" component={Statistics} />
            </IonRouterOutlet>
            <IonTabBar
              slot="bottom"
              style={{
                '--background': '#fff',
                '--color': '#999',
                '--color-selected': '#52c41a',
                '--border': '1px solid #e8e8e8',
                boxShadow: '0 -1px 6px rgba(0,0,0,0.04)',
              } as any}
            >
              <IonTabButton tab="home" href="/" style={{ '--color': '#999', '--color-selected': '#52c41a' } as React.CSSProperties}>
                <IonIcon icon={homeOutline} style={{ fontSize: 22 }} />
                <IonLabel style={{ fontSize: 11, marginTop: 2 }}>{'\u9996\u9875'}</IonLabel>
              </IonTabButton>
              <IonTabButton tab="history" href="/history" style={{ '--color': '#999', '--color-selected': '#52c41a' } as React.CSSProperties}>
                <IonIcon icon={timeOutline} style={{ fontSize: 22 }} />
                <IonLabel style={{ fontSize: 11, marginTop: 2 }}>{'\u5386\u53f2'}</IonLabel>
              </IonTabButton>
              <IonTabButton tab="statistics" href="/statistics" style={{ '--color': '#999', '--color-selected': '#52c41a' } as React.CSSProperties}>
                <IonIcon icon={statsChartOutline} style={{ fontSize: 22 }} />
                <IonLabel style={{ fontSize: 11, marginTop: 2 }}>{'\u7edf\u8ba1'}</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>

          {/* Independent routes (outside tabs) */}
          <Route exact path="/setup" component={Setup} />
          <Route exact path="/settings" render={() => <GuardedRoute component={Settings} />} />
        </Suspense>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
