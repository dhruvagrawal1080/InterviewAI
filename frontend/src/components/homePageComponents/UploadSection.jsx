import UploadBox from "../UploadBox";

const UploadSection = () => {
  return (
    <section id="upload-section" className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Your Interview Preparation
            </h2>
            <p className="text-gray-300">
              Upload your resume or describe your background to create a personalized interview experience
            </p>
          </div>

          {/* Upload & Description Card */}
          <div className="rounded-xl overflow-hidden">
            <UploadBox />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
