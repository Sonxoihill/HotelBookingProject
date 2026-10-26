package com.hotel.booking.repository;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.repository.projection.CategoryShareProjection;
import com.hotel.booking.repository.projection.TimeRevenueProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Booking, Long> {

    @Query(value = """
        SELECT 
            DATE_FORMAT(b.check_out, '%Y-%m') AS timeLabel,
            COALESCE(SUM(b.total_amount), 0) AS totalRev,
            COALESCE(SUM(st.service_rev), 0) AS serviceRev,
            COUNT(b.id) AS bookingCount,
            COALESCE(SUM(DATEDIFF(b.check_out, b.check_in)), 0) AS occupiedNights
        FROM bookings b
        LEFT JOIN (
            SELECT booking_id, SUM(price * quantity) AS service_rev
            FROM booking_services
            GROUP BY booking_id
        ) st ON b.id = st.booking_id
        WHERE b.status = 'CHECKED_OUT'
          AND b.check_out >= :startDate AND b.check_out <= :endDate
        GROUP BY DATE_FORMAT(b.check_out, '%Y-%m')
        ORDER BY timeLabel ASC
        """, nativeQuery = true)
    List<TimeRevenueProjection> getMonthlyRevenue(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT 
            DATE_FORMAT(b.check_out, '%Y-%m-%d') AS timeLabel,
            COALESCE(SUM(b.total_amount), 0) AS totalRev,
            COALESCE(SUM(st.service_rev), 0) AS serviceRev,
            COUNT(b.id) AS bookingCount,
            COALESCE(SUM(DATEDIFF(b.check_out, b.check_in)), 0) AS occupiedNights
        FROM bookings b
        LEFT JOIN (
            SELECT booking_id, SUM(price * quantity) AS service_rev
            FROM booking_services
            GROUP BY booking_id
        ) st ON b.id = st.booking_id
        WHERE b.status = 'CHECKED_OUT'
          AND b.check_out >= :startDate AND b.check_out <= :endDate
        GROUP BY DATE_FORMAT(b.check_out, '%Y-%m-%d')
        ORDER BY timeLabel ASC
        """, nativeQuery = true)
    List<TimeRevenueProjection> getDailyRevenue(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT 
            c.name AS categoryName,
            COUNT(b.id) AS bookingCount,
            COALESCE(SUM(b.total_amount), 0) AS revenue
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN room_categories c ON r.category_id = c.id
        WHERE b.status = 'CHECKED_OUT'
          AND b.check_out >= :startDate AND b.check_out <= :endDate
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
        """, nativeQuery = true)
    List<CategoryShareProjection> getCategoryShare(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
