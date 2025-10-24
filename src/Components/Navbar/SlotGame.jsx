import React, { useState, useEffect } from "react";
import "./game.scss";
import s1 from "../../assets/imgi_3_zeus-11.png";
import s2 from "../../assets/imgi_3_zeus-10.png";
import s3 from "../../assets/imgi_3_zeus-9.png";
import spinlogo from "../../assets/pngwing.com (5).png";

const symbols = [s1, s2, s3];

const SlotGame = () => {
  const [jackpot, setJackpot] = useState(12000344); // Player chips
  const [bet, setBet] = useState(12000344 / 10); // Bet = 1/10 of jackpot
  const [totalJackpot, setTotalJackpot] = useState(1222470520); // Auto increasing jackpot
  const [spinning, setSpinning] = useState(false);
  const [rows, setRows] = useState([
    [s1, s2, s3],
    [s2, s3, s1],
    [s3, s1, s2],
  ]);
  const [winner, setWinner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stoppingColumns, setStoppingColumns] = useState([false, false, false]);
  const [winCount, setWinCount] = useState(0); // Track number of wins
  const [timer, setTimer] = useState({
    hours: 0,
    minutes: 1,
    seconds: 24,
  });

  // ✅ Auto-increase only total jackpot
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalJackpot(
        (prev) => prev + Math.floor(Math.random() * 10000 + 5000)
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer (only runs when modal opens)
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

  const randomSymbol = () =>
    symbols[Math.floor(Math.random() * symbols.length)];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(false);
    setShowModal(false);
    setStoppingColumns([false, false, false]);

    const spinDuration = 2500;
    const isWin = Math.random() > 0.3;
    let finalRows;

    // Generate win/lose results
    if (isWin) {
      const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      finalRows = [
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [winSymbol, winSymbol, winSymbol],
        [randomSymbol(), randomSymbol(), randomSymbol()],
      ];
      for (let col = 0; col < 3; col++) {
        while (finalRows[0][col] === winSymbol)
          finalRows[0][col] = randomSymbol();
        while (finalRows[2][col] === winSymbol)
          finalRows[2][col] = randomSymbol();
      }
    } else {
      finalRows = [
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
      ];
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

    // Column stop sequence
    setTimeout(() => {
      setStoppingColumns([true, false, false]);
      setRows((prev) => [
        [finalRows[0][0], prev[0][1], prev[0][2]],
        [finalRows[1][0], prev[1][1], prev[1][2]],
        [finalRows[2][0], prev[2][1], prev[2][2]],
      ]);
    }, spinDuration);

    setTimeout(() => {
      setStoppingColumns([true, true, false]);
      setRows((prev) => [
        [prev[0][0], finalRows[0][1], prev[0][2]],
        [prev[1][0], finalRows[1][1], prev[1][2]],
        [prev[2][0], finalRows[2][1], prev[2][2]],
      ]);
    }, spinDuration + 800);

    // ✅ Final column stop and win check
    setTimeout(() => {
      setStoppingColumns([true, true, true]);
      setRows(finalRows);

      setTimeout(() => {
        const middle = finalRows[1];
        const isWinner = middle[0] === middle[1] && middle[1] === middle[2];

        setWinner(isWinner);
        setSpinning(false);

        if (isWinner) {
          setWinCount((prev) => {
            const newCount = prev + 1;
            if (newCount === 1) {
              setTimeout(() => setShowModal(true), 1000);
            }
            return newCount;
          });
        }
      }, 500);
    }, spinDuration + 1600);
  };

  // Increase / Decrease bet manually
  const handleIncreaseBet = () => {
    if (jackpot <= 0) return;
    const amount = 1000;
    if (jackpot - amount < 0) return;
    setBet((prev) => prev + amount);
    setJackpot((prev) => prev - amount);
  };

  const handleDecreaseBet = () => {
    const amount = 1000;
    if (bet - amount < 1000) return;
    setBet((prev) => prev - amount);
    setJackpot((prev) => prev + amount);
  };

  return (
    <div className="SlotGame">
      <div className="SlotGame-container">
        <div className="jackpoint-box">
          <h3>
            <span>💥Total JACKPOT</span> <br /> Rp.{" "}
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
          <button className="plus-button" onClick={handleDecreaseBet}>
            -
          </button>
          <button onClick={handleSpin} disabled={spinning}>
            <img src={spinlogo} alt="spin" />
          </button>
          <button className="plus-button" onClick={handleIncreaseBet}>
            +
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
            <h3>Rp {bet.toLocaleString()}</h3>
            <p>Double Amount</p>
          </div>
        </div>
      </div>

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
