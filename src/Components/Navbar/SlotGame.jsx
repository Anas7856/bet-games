import React, { useState, useEffect } from "react";
import "./game.scss";
import s1 from "../../assets/imgi_3_zeus-11.png";
import s2 from "../../assets/imgi_3_zeus-10.png";
import s3 from "../../assets/imgi_3_zeus-9.png";

const symbols = [s1, s2, s3];

const SlotGame = () => {
  const [jackpot, setJackpot] = useState(12000344);
  const [totalJackpot, setTotalJackpot] = useState(1222470520);
  const [spinning, setSpinning] = useState(false);
  const [rows, setRows] = useState([
    [s1, s2, s3],
    [s2, s3, s1],
    [s3, s1, s2],
  ]);
  const [winner, setWinner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stoppingColumns, setStoppingColumns] = useState([false, false, false]);
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

  // Auto-increase total jackpot
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalJackpot(
        (prev) => prev + Math.floor(Math.random() * 10000 + 5000)
      );
    }, 2000);
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
    setStoppingColumns([false, false, false]);

    let spinDuration = 2500;

    // Generate final result - determine if it's a win or not
    const isWin = Math.random() > 0.3; // 70% chance to win
    let finalRows;

    if (isWin) {
      const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      // Winner only in middle row (index 1)
      finalRows = [
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [winSymbol, winSymbol, winSymbol], // Middle row wins
        [randomSymbol(), randomSymbol(), randomSymbol()],
      ];
      // Ensure other rows don't accidentally match
      for (let col = 0; col < 3; col++) {
        while (finalRows[0][col] === winSymbol) {
          finalRows[0][col] = randomSymbol();
        }
        while (finalRows[2][col] === winSymbol) {
          finalRows[2][col] = randomSymbol();
        }
      }
    } else {
      // Make sure no row has all same symbols
      finalRows = [
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
      ];
      // Ensure middle row has different symbols
      for (let col = 0; col < 3; col++) {
        while (
          finalRows[1][0] === finalRows[1][1] ||
          finalRows[1][1] === finalRows[1][2] ||
          finalRows[1][0] === finalRows[1][2]
        ) {
          finalRows[1][1] = randomSymbol();
          finalRows[1][2] = randomSymbol();
        }
      }
    }

    // Stop first column after 2.5 seconds
    setTimeout(() => {
      setStoppingColumns([true, false, false]);
      setRows((prevRows) => [
        [finalRows[0][0], prevRows[0][1], prevRows[0][2]],
        [finalRows[1][0], prevRows[1][1], prevRows[1][2]],
        [finalRows[2][0], prevRows[2][1], prevRows[2][2]],
      ]);
    }, spinDuration);

    // Stop second column after 3.3 seconds
    setTimeout(() => {
      setStoppingColumns([true, true, false]);
      setRows((prevRows) => [
        [prevRows[0][0], finalRows[0][1], prevRows[0][2]],
        [prevRows[1][0], finalRows[1][1], prevRows[1][2]],
        [prevRows[2][0], finalRows[2][1], prevRows[2][2]],
      ]);
    }, spinDuration + 800);

    // Stop third column after 4.1 seconds and set final result
    setTimeout(() => {
      setStoppingColumns([true, true, true]);
      setRows(finalRows);

      setTimeout(() => {
        // Check if MIDDLE row (index 1) is a winner
        const middleRowSymbols = finalRows[1];
        const isWinner =
          middleRowSymbols[0] === middleRowSymbols[1] &&
          middleRowSymbols[1] === middleRowSymbols[2];

        setWinner(isWinner);
        setSpinning(false);

        if (isWinner) {
          setTimeout(() => setShowModal(true), 1000);
        }
      }, 500);
    }, spinDuration + 1600);
  };

  const randomSymbol = () =>
    symbols[Math.floor(Math.random() * symbols.length)];

  return (
    <div className="SlotGame">
      <div className="SlotGame-container">
        <div className="jackpoint-box">
          <h3>
            <span>Total JACKPOT</span> <br /> Rp.{" "}
            {totalJackpot.toLocaleString()}.00
          </h3>
        </div>
        <div className="slot-game-main-box">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`slot-game-main-box-inner ${
                winner && i === 1 ? "winner" : ""
              }`}
            >
              {row.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="symbol"
                  className={
                    spinning && !stoppingColumns[index]
                      ? "spinning"
                      : stoppingColumns[index] && spinning
                      ? "stopping"
                      : ""
                  }
                />
              ))}
            </div>
          ))}
        </div>

        <div className="slot-button-box">
          <button onClick={handleSpin} disabled={spinning}>
            spin
          </button>
        </div>
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
