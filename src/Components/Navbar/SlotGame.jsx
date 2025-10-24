import React, { useState, useEffect } from "react";
import "./game.scss";
import s1 from "../../assets/imgi_3_zeus-11.png";
import s2 from "../../assets/imgi_3_zeus-10.png";
import s3 from "../../assets/imgi_3_zeus-9.png";
import btnlog from "../../assets/circle-arrow-looping-arrows-for-refresh-icon-rm2MjPp4-removebg-preview.png";
const symbols = [s1, s2, s3];

const SlotGame = () => {
  const [jackpot, setJackpot] = useState(12000344);
  const [spinning, setSpinning] = useState(false);
  const [rows, setRows] = useState([
    [s1, s2, s3],
    [s2, s3, s1],
    [s3, s1, s2],
  ]);
  const [winner, setWinner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState({
    hours: 0,
    minutes: 1,
    seconds: 24,
  });

  // Auto-increase jackpot
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Math.floor(Math.random() * 500 + 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (!showModal) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(interval);
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showModal]);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(false);
    setShowModal(false);

    let spinDuration = 2000;
    let spinInterval = setInterval(() => {
      setRows([
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const newRows = [
        [winSymbol, winSymbol, winSymbol],
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
      ];
      setRows(newRows);
      setWinner(true);
      setSpinning(false);
      setTimeout(() => setShowModal(true), 1000); // Show modal after 1s delay
    }, spinDuration);
  };

  const randomSymbol = () =>
    symbols[Math.floor(Math.random() * symbols.length)];

  return (
    <div className="SlotGame">
      <div className="SlotGame-container">
        <div className="bet-main-box">
          <div className="bet-main-box-inner">
            <h4>Buy</h4>
            <p>Free Spins</p>
            <h3>Rp {jackpot.toLocaleString()}</h3>
          </div>
          <div className="bet-main-box-inner">
            <h4>Bet</h4>
            <h3>Rp {(jackpot / 10).toLocaleString()}</h3>
            <p>Double Amount</p>
          </div>
        </div>

        <div className="slot-game-main-box">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`slot-game-main-box-inner ${
                winner && i === 0 ? "winner" : ""
              } ${spinning ? "spinning" : ""}`}
            >
              {row.map((img, index) => (
                <img key={index} src={img} alt="symbol" />
              ))}
            </div>
          ))}
        </div>

        <div className="slot-button-box">
          <button className="plus-button">+</button>
          <button onClick={handleSpin} disabled={spinning}>
            <img src={btnlog} alt="" />
          </button>
          <button className="plus-button">-</button>
        </div>
      </div>

      {/* JACKPOT MODAL */}
      {showModal && (
        <div className="jackpot-modal">
          <div className="jackpot-modal-content">
            <h2>💥 JACKPOT!</h2>
            <h3>🎉 PENDETEKSI SYSTEM BERHASIL 💰</h3>
            <p>
              🎲 Daftar dan Nikmati Akun Gacor di <span>TOTO12</span>
            </p>
            <p>🏦 Situs Resmi PG Soft</p>
            <div className="timer">
              <p>💬 Pastikan untuk Buat Akun Sebelum Waktu di bawah habis:</p>
              <h4>
                {String(timer.hours).padStart(2, "0")} JAM{" "}
                {String(timer.minutes).padStart(2, "0")} MENIT{" "}
                {String(timer.seconds).padStart(2, "0")} DETIK
              </h4>
            </div>
            <button className="cta-btn">👉 BUAT AKUN GACOR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotGame;
