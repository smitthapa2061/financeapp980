import React, { useEffect, useState } from "react";
import axios from "axios";
import Display from "../displayCustomers/display";

export default function TeamSelector() {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [message, setMessage] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [showAll, setShowAll] = useState(false); // NEW: toggle all
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState({
    customerName: "",
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

  // Fetch teams
  const fetchTeams = async () => {
    try {
      const res = await axios.get(
        "https://hisab-backend-hu8f.onrender.com/api/bookingData"
      );
      setTeams(res.data);
    } catch {
      setMessage("Failed to load teams");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCheckboxChange = (teamName) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName)
        ? prev.filter((t) => t !== teamName)
        : [...prev, teamName]
    );
  };

  const handleUpdateBooking = async (
    teamName,
    bookingIndex,
    updatedBooking
  ) => {
    try {
      await axios.put(
        `https://hisab-backend-hu8f.onrender.com/api/bookingData/${teamName}/bookings/${bookingIndex}`,
        updatedBooking
      );
      setMessage("Booking updated successfully");
      await fetchTeams();
    } catch (error) {
      setMessage("Failed to update booking: " + error.message);
    }
  };

  const handleDeleteBooking = async (teamName, bookingIndex) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;
    try {
      await axios.delete(
        `https://hisab-backend-hu8f.onrender.com/api/bookingData/${teamName}/bookings/${bookingIndex}`
      );
      setMessage("Booking deleted successfully");
      await fetchTeams();
    } catch (error) {
      setMessage("Failed to delete booking: " + error.message);
    }
  };

 // Retry once if no response
const handleDeleteTeam = async (teamName) => {
  if (!window.confirm(`Are you sure you want to delete team "${teamName}" and all its bookings?`)) return;

  const encodedName = encodeURIComponent(teamName);
  const url = `https://hisab-backend-hu8f.onrender.com/api/bookingData/${encodedName}`;

  try {
    await axios.delete(url);
    setMessage(`Team "${teamName}" deleted successfully.`);
    await fetchTeams();
    setSelectedTeams((prev) => prev.filter((t) => t !== teamName));
  } catch (error) {
    if (error.request && !error.response) {
      // Retry once after 1 second
      try {
        await new Promise((res) => setTimeout(res, 1000));
        await axios.delete(url);
        setMessage(`Team "${teamName}" deleted successfully (after retry).`);
        await fetchTeams();
        setSelectedTeams((prev) => prev.filter((t) => t !== teamName));
        return;
      } catch (retryError) {
        setMessage("Still failed after retry: " + retryError.message);
        console.error("Retry error:", retryError);
      }
    } else if (error.response) {
      setMessage(`Failed: ${error.response.status} - ${error.response.data.message || "Server error"}`);
    } else {
      setMessage("Unexpected error: " + error.message);
    }
  }
};


  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setBooking((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      setMessage("Team name cannot be empty.");
      return;
    }
    try {
      const res = await axios.post(
        "https://hisab-backend-hu8f.onrender.com/api/bookingData",
        {
          teamName: newTeamName,
          bookings: [],
        }
      );
      setTeams((prev) => [...prev, res.data]);
      setMessage(`Team "${res.data.teamName}" created.`);
      setNewTeamName("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Error creating team. Try again."
      );
    }
  };

  const handleAddBooking = async () => {
    if (selectedTeams.length === 0) {
      setMessage("Please select at least one team to add booking.");
      return;
    }

    setIsSubmitting(true); // disable button
    try {
      await Promise.all(
        selectedTeams.map((teamName) =>
          axios.post(
            `https://hisab-backend-hu8f.onrender.com/api/bookingData/${teamName}/bookings`,
            booking
          )
        )
      );
      setMessage("Booking added successfully to selected teams!");
      setBooking({
        customerName: "",
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
      setSelectedTeams([]); // Clear selected checkboxes
      await fetchTeams();
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error";
      setMessage(`Error adding booking: ${errMsg}`);
    } finally {
      setIsSubmitting(false); // re-enable button
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowAll((prev) => !prev)}
        className="bg-black text-white p-[10px] ml-[100px]  mt-[10px]"
        style={{ padding: "10px", width: "15%", marginBottom: 20 }}
      >
        {showAll ? "Hide Team Management" : "Show Team Management"}
      </button>

      {showAll && (
        <>
          <div className="font-[500]">
            <h2 className="relative left-[100px]">Add New Team</h2>

            <div
              style={{ display: "flex", marginBottom: 16 }}
              className="relative left-[100px]"
            >
              <input
                type="text"
                placeholder="New team name"
                className="border-[2px] border-black "
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <button
                onClick={handleAddTeam}
                className="bg-black text-white p-[10px] ml-[20px] "
              >
                Add Team
              </button>
            </div>

            <h2 className="relative left-[100px]">Select Teams</h2>
            {message && (
              <p className="relative left-[500px] top-[500px]">{message}</p>
            )}
            {teams.length === 0 && !message && <p>Loading teams...</p>}
            <form className="relative left-[100px] ">
              {teams
                .filter(({ teamName }) =>
                  teamName.toLowerCase().includes(newTeamName.toLowerCase())
                )
                .map(({ teamName, _id }) => (
                  <div className="text-red-600 font-bold text-[2rem]" key={_id}>
                    <label>
                      <input
                        type="checkbox"
                        value={teamName}
                        checked={selectedTeams.includes(teamName)}
                        onChange={() => handleCheckboxChange(teamName)}
                      />
                      {" " + teamName}
                    </label>
                  </div>
                ))}
            </form>

            <div className="absolute left-[500px] top-[500px]">
              <h2
                className="text-xl font-bold mb-4"
                style={{ marginTop: -400 }}
              >
                Add Booking Entry
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddBooking();
                }}
                className="flex flex-col gap-3 items-start"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>DATE</label>
                    <input
                      className="border-2 border-black w-full p-2"
                      type="text"
                      name="date"
                      value={booking.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>TIME</label>
                    <input
                      className="border-2 border-black w-full p-2"
                      type="text"
                      name="time"
                      value={booking.time}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>SERVER</label>
                    <input
                      className="border-2 border-black w-full p-2"
                      type="text"
                      name="server"
                      placeholder="Server"
                      value={booking.server}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>ENTREE FEE</label>
                    <input
                      className="border-2 border-black w-full p-2"
                      type="number"
                      name="entryFee"
                      placeholder="Entry Fee"
                      value={booking.entryFee}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div>
                    <label>WINNING</label>
                    <input
                      className="border-2 border-black w-full p-2"
                      type="number"
                      name="winning"
                      placeholder="Winning"
                      value={booking.winning}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                  <div>
                    <label>DISCRIPTION</label>
                    <input
                      className="border-2 border-black w-full p-2"
                      type="text"
                      name="discription"
                      placeholder="Description"
                      value={booking.discription}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>BOOKED BY</label>
                    <input
                      className="border-2 border-black w-full p-2"
                      type="text"
                      name="caster"
                      placeholder=""
                      value={booking.caster}
                      onChange={handleInputChange}
                    />
                  </div>
               
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`p-2 w-[300px] mt-4 font-semibold transition ${
                    isSubmitting
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Add Booking to Selected Teams"}
                </button>
              </form>
            </div>

            <div
              className="left-[480px] absolute text-red-500 font-bold top-[700px]"
              style={{ marginTop: 20 }}
            >
              <strong>Selected Teams:</strong>{" "}
              {selectedTeams.join(", ") || "None"}
            </div>
          </div>
        </>
      )}
      <Display
        teams={teams}
        onDeleteTeam={handleDeleteTeam}
        onUpdateBooking={handleUpdateBooking}
        onDeleteBooking={handleDeleteBooking}
      />
    </div>
  );
}
