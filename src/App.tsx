import Navigation from "./components/Navigation";
import DateProvider from "./context/DateProvider";
import EventProvider from "./context/EventProvider";
import ToastProvider from "./context/ToastContext";
import Calendar from "./components/Calendar";

function App() {
  return (
    <ToastProvider>
      <EventProvider>
        <DateProvider>
          <main className="w-full h-screen bg-slate-100 flex flex-col overflow-hidden">
            <Navigation />
            <Calendar />
          </main>
        </DateProvider>
      </EventProvider>
    </ToastProvider>
  );
}

export default App;
