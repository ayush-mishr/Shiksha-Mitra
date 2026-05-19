import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"
import { HiMenuAlt2 } from "react-icons/hi"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"

export default function ViewCourse() {

  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      const courseData = await getFullDetailsOfCourse(courseId, token)
      // console.log("Course Data here... ", courseData.courseDetails)
      dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
      dispatch(setEntireCourseData(courseData.courseDetails))
      dispatch(setCompletedLectures(courseData.completedVideos))
      let lectures = 0
      courseData?.courseDetails?.courseContent?.forEach((sec) => {
        lectures += sec.subSection.length
      })
      dispatch(setTotalNoOfLectures(lectures))
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        <VideoDetailsSidebar 
          setReviewModal={setReviewModal} 
          courseSidebarOpen={courseSidebarOpen}
          setCourseSidebarOpen={setCourseSidebarOpen}
        />
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto relative">
          {/* Toggle sidebar button for mobile */}
          <button
            onClick={() => setCourseSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 p-2 rounded-full bg-richblack-800 border border-richblack-700 text-richblack-25 lg:hidden hover:scale-95 transition-all duration-200 shadow-md"
            title="Show Course Outline"
          >
            <HiMenuAlt2 size={20} />
          </button>
          <div className="mx-6 pt-16 lg:pt-6">
            <Outlet />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}
