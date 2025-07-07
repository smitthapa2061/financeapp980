import React, { useState } from "react";

export default function DisplayBookings({
  teams,
  refreshTeams,
  onUpdateBooking,
  onDeleteBooking,
  onDeleteTeam,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBooking, setEditingBooking] = useState(null); // { teamName, index } or null
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    server: "",
    entryFee: 0,
    winning: 0,
    discription: "",
    caster: "",
    casterCost: 0,
    production: "",
    productionCost: 0,
  });

  if (!teams) return <p>Loading teams...</p>;

const lowerSearch = searchTerm.toLowerCase().trim();

const filteredTeams = teams
  .map(team => {
    const matchTeamName = team.teamName?.toLowerCase().trim() === lowerSearch;

    const matchedBookings = team.bookings?.filter(b => {
      const matchDate = b.date?.toLowerCase().trim() === lowerSearch;
      const matchCaster = b.caster?.toLowerCase().trim() === lowerSearch;
      return matchDate || matchCaster;
    }) || [];

    if (matchTeamName || matchedBookings.length > 0) {
      return {
        ...team,
        bookings: matchTeamName ? team.bookings : matchedBookings, // if team name matched, show all bookings
      };
    }

    return null;
  })
 




  .filter(Boolean)
    .sort((a, b) => {
      const totalA = a.bookings.reduce((sum, b) => sum + (b.entryFee || 0), 0);
      const totalB = b.bookings.reduce((sum, b) => sum + (b.entryFee || 0), 0);
      return totalB - totalA; // Descending order (highest first)
    });

  const handleEditBookingClick = (teamName, booking, index) => {
    setEditingBooking({ teamName, index });
    setBookingForm({ ...booking });
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: ["entryFee", "winning", "casterCost", "productionCost"].includes(
        name
      )
        ? Number(value)
        : value,
    }));
  };

  const handleSaveBooking = () => {
    if (!editingBooking) return;
    onUpdateBooking(editingBooking.teamName, editingBooking.index, bookingForm);
    setEditingBooking(null);
  };

  const handleDeleteBooking = (teamName, index) => {
    if (
      window.confirm(
        `Are you sure you want to delete booking #${
          index + 1
        } from team "${teamName}"?`
      )
    ) {
      onDeleteBooking(teamName, index);
    }
  };

  const getProfitForRange = (startDate, endDate) => {
  let entryFee = 0;
  let winning = 0;

  teams.forEach((team) => {
    team.bookings.forEach((booking) => {
      const bookingDate = new Date(booking.date);
      if (bookingDate >= startDate && bookingDate <= endDate) {
        entryFee += booking.entryFee || 0;
        winning += booking.winning || 0;
      }
    });
  });

  return entryFee - winning;
};

// Today
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// This week (last 7 days including today)
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
sevenDaysAgo.setHours(0, 0, 0, 0);

// This month (last 30 days including today)
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
oneMonthAgo.setHours(0, 0, 0, 0);

// Calculate profits
const todayProfit = getProfitForRange(today, tomorrow);
const weekProfit = getProfitForRange(sevenDaysAgo, new Date());
const monthProfit = getProfitForRange(oneMonthAgo, new Date());



  // Totals calculation (grand)
  const grandTotals = filteredTeams.reduce(
  (totals, team) => {
    team.bookings.forEach((b) => {
      const entry = b.entryFee || 0;
      const win = b.winning || 0;
      totals.entryFee += entry;
      totals.winning += win;
      totals.netTotal += entry - win;
    });
    return totals;
  },
  { entryFee: 0, winning: 0, netTotal: 0 } // ← make sure this initializer is present
);


  const thTdStyleLeft = {
    padding: "8px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
  };
  const thTdStyleRight = {
    padding: "8px",
    textAlign: "right",
    borderBottom: "1px solid #ddd",
  };

  return (
    <div className="mt-[100px]">
      <h2>Team Bookings Overview</h2>



      <input
        type="text"
        placeholder="Search teams by name / DATE / BOOKED BY"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          marginBottom: "20px",
          fontSize: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      />

      {/* Grand Totals Summary */}
      {/* Distribution Summary */}
     

      <div
        style={{
          marginBottom: "30px",
          padding: "16px",
          backgroundColor: "#e3f2fd",
          borderRadius: "6px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        <div
       className="ml-[20px] ]"
        >
          <span >Total Entry Fee: Rs {Math.round(grandTotals.entryFee)}</span>
          <span className="ml-[200px]">Total Winning: Rs {Math.round(grandTotals.winning)}</span>
            <span className="ml-[200px]">Total profit: Rs {Math.round(grandTotals.netTotal)}</span>
         <p><strong>Today's Profit:</strong> Rs {todayProfit}</p>
  <p><strong>Last 7 Days Profit:</strong> Rs {weekProfit}</p>
   <p><strong>30 Days Profit:</strong> Rs {monthProfit}</p>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        filteredTeams.map((team) => {
          const totalEntryFee = team.bookings.reduce(
            (sum, b) => sum + (b.entryFee || 0),
            0
          );
          const totalWinning = team.bookings.reduce(
            (sum, b) => sum + (b.winning || 0),
            0
          );
          
          const totalCasterCost = team.bookings.reduce(
            (sum, b) => sum + (b.casterCost || 0),
            0
          );
          const totalProductionCost = team.bookings.reduce(
            (sum, b) => sum + (b.productionCost || 0),
            0
          );

          const totalTeamAmount = totalEntryFee - totalWinning;
          const totalNetAmount =
            totalEntryFee -
            totalWinning -
            totalProductionCost -
            totalCasterCost;

          return (
            <div key={team._id} style={{ marginBottom: "60px" }}>
              <h3
                style={{ marginBottom: "12px" }}
                className="text-[40px] font-bold text-red-600 text-left ml-[30px] "
              >
                TEAM - {team.teamName}
                <button
                  className=""
                  style={{
                    marginLeft: "20px",
                    padding: "6px 12px",
                    backgroundColor: "#d32f2f",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  onClick={() => onDeleteTeam(team.teamName)}
                >
                  Delete Team
                </button>
              </h3>

              {team.bookings.length === 0 ? (
                <p>No bookings available.</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    marginBottom: "8px",
                  }}
                >
                  <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
                    <tr>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Date
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Time
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Server
                      </th>
                      <th style={{ padding: "10px", textAlign: "right" }}>
                        Entry Fee
                      </th>
                      <th style={{ padding: "10px", textAlign: "right" }}>
                        Winning
                      </th>
                      <th style={{ padding: "10px", textAlign: "left" }}>
                        Description
                      </th>
                   
                   <th style={{ padding: "10px", textAlign: "left" }}>
                        Booked by
                      </th>
               
                    
                      <th style={{ padding: "10px", textAlign: "center" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.bookings.map((b, index) => {
                      // If this booking is being edited, show input fields
                      if (
                        editingBooking &&
                        editingBooking.teamName === team.teamName &&
                        editingBooking.index === index
                      ) {
                        return (
                          <tr
                            key={index}
                            style={{ backgroundColor: "#ffffcc" }}
                          >
                            <td style={thTdStyleLeft}>
                              <input
                                type="text"
                                name="date"
                                value={bookingForm.date}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                              />
                            </td>
                            <td style={thTdStyleLeft}>
                              <input
                                type="text"
                                name="time"
                                value={bookingForm.time}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                              />
                            </td>
                            <td style={thTdStyleLeft}>
                              <input
                                type="text"
                                name="server"
                                value={bookingForm.server}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                              />
                            </td>
                            <td style={thTdStyleRight}>
                              <input
                                type="number"
                                name="entryFee"
                                value={bookingForm.entryFee}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                                min="0"
                              />
                            </td>
                            <td style={thTdStyleRight}>
                              <input
                                type="number"
                                name="winning"
                                value={bookingForm.winning}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                                min="0"
                              />
                            </td>
                            <td style={thTdStyleLeft}>
                              <input
                                type="text"
                                name="discription"
                                value={bookingForm.discription}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                              />
                            </td>
                            <td style={thTdStyleLeft}>
                              <input
                                type="text"
                                name="caster"
                                value={bookingForm.caster}
                                onChange={handleChange}
                                style={{ width: "100%" }}
                              />
                            </td>
                          
                            <td style={{ textAlign: "center" }}>
                              <button
                                style={{
                                  marginRight: "6px",
                                  padding: "4px 8px",
                                  backgroundColor: "#4caf50",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={handleSaveBooking}
                              >
                                Save
                              </button>
                              <button
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#f44336",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      // Otherwise show regular row
                      return (
                        <tr
                          key={index}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#f9f9f9" : "white",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <td style={thTdStyleLeft}>{b.date}</td>
                          <td style={thTdStyleLeft}>{b.time}</td>
                          <td style={thTdStyleLeft}>{b.server}</td>
                          <td style={thTdStyleRight}>
                            Rs {Math.round(b.entryFee)}
                          </td>
                          <td style={thTdStyleRight}>
                            Rs {Math.round(b.winning)}
                          </td>
                          <td style={thTdStyleLeft}>{b.discription}</td>
                          <td style={thTdStyleLeft}>{b.caster}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              style={{
                                marginRight: "6px",
                                padding: "4px 8px",
                                backgroundColor: "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                handleEditBookingClick(team.teamName, b, index)
                              }
                            >
                              Update
                            </button>
                            <button
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                handleDeleteBooking(team.teamName, index)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot
                    style={{
                      backgroundColor: "#e3f2fd",
                      fontWeight: "bold",
                      borderTop: "2px solid #1976d2",
                    }}
                  >
                    <tr>
                      <td
                        colSpan={3}
                        style={{ padding: "8px", textAlign: "right" }}
                      >
                        Totals:
                      </td>
                      <td style={thTdStyleRight}>
                        Rs {Math.round(totalEntryFee)}
                      </td>
                      <td style={thTdStyleRight}>
                        Rs {Math.round(totalWinning)}
                      </td>
                      <td></td>
                      <td></td>
                     
                      <td></td>
                    </tr>

                    <tr>
                      <td
                        colSpan={11}
                        style={{ borderTop: "2px solid #1976d2", padding: 0 }}
                      ></td>
                    </tr>

                    <tr
                      style={{ backgroundColor: "#bbdefb", fontWeight: "bold" }}
                    >
                      <td
                        colSpan={10}
                        style={{ padding: "8px", textAlign: "left" }}
                      >
                        {totalTeamAmount >= 0
                          ? "Total Team Entry (Entry Fee - Winning):"
                          : "Total Winning (Winning - Entry Fee):"}
                      </td>
                      <td className="absolute left-[300px] text-white bg-red-600 w-[160px] text-center text-[1.9rem]">
                        Rs {Math.round(Math.abs(totalTeamAmount))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
