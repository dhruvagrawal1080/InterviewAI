import HeroSection from "../components/homePageComponents/HeroSection"
import UploadSection from "../components/homePageComponents/UploadSection"
import InterviewSection from "../components/homePageComponents/InterviewSection"
import SummarySection from "../components/homePageComponents/SummarySection"
import Footer from "../components/homePageComponents/Footer"

const Home = () => {
    return (
        <div className="bg-[#121A2C] pt-20">
            <HeroSection />
            <UploadSection />
            <InterviewSection />
            <SummarySection />
            <Footer />
        </div>
    )
}

export default Home