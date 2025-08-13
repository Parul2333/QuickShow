import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ClockIcon, ArrowRightIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import { assets } from "../assets/assets"
import toast from 'react-hot-toast'

const SeatLayout = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]
  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)  // Fixed initialization
  const [show, setShow] = useState(null)  // Fixed initialization
  const navigate = useNavigate()

  const getShow = async () => {
    try {
      const showData = dummyShowsData.find(show => show._id === id)
      if (!showData) {
        toast.error("Show not found!")
        navigate('/')
        return
      }
      
      // Validate date exists in show data
      if (!dummyDateTimeData[date]) {
        toast.error("Invalid show date!")
        navigate('/')
        return
      }

      setShow({
        movie: showData,
        dateTime: dummyDateTimeData
      })
    } catch (error) {
      console.error("Error loading show:", error)
      toast.error("Failed to load show details")
      navigate('/')
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      toast.error("Please select time first")
      return
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      toast.error("You can only select up to 5 seats")
      return
    }
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(seat => seat !== seatId) 
        : [...prev, seatId]
    )
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className='flex gap-2 mt-2'>
      <div className='flex flex-wrap items-center justify-center gap-2'>
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`
          return (
            <button 
              key={seatId} 
              onClick={() => handleSeatClick(seatId)} 
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
                ${selectedSeats.includes(seatId) ? "bg-primary text-white" : ""}
                ${!selectedTime ? "opacity-50" : ""}`}
              disabled={!selectedTime}
            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  const handleProceedToCheckout = () => {
    if (!selectedTime) {
      toast.error("Please select a time slot")
      return
    }
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat")
      return
    }
    navigate('/my-bookings')
  }

  useEffect(() => {
    if (!id || !date) {
      toast.error("Invalid show or date")
      navigate('/')
      return
    }
    getShow()
  }, [id, date, navigate])

  if (!show) return <Loading />

  return (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
      {/* Available Timings */}
      <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
        <p className='text-lg font-semibold px-6'>Available Timings</p>
        <div className='mt-5 space-y-1'>
          {show.dateTime[date]?.map((item) => (
            <div 
              key={item.time} 
              onClick={() => setSelectedTime(item)}  
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition 
                ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"}`}
            >
              <ClockIcon className='w-4 h-4'/>
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0px" right="0px" />
        <h1 className='text-2xl font-semibold mb-4'>Select Your Seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className='text-gray-400 text-sm mb-0'>SCREEN SIDE</p>
        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {groupRows[0].map(row => renderSeats(row))}
          </div>
          <div className='grid grid-cols-2 gap-11'>
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>
                {group.map(row => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleProceedToCheckout}
          className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={!selectedTime || selectedSeats.length === 0}
        > 
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default SeatLayout