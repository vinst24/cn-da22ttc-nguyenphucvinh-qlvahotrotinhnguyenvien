import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Volunteer tham gia hoạt động
 * POST /events/:id/join
 */
export const joinEvent = async (req, res) => {
  try {
    var userId = req.user.id;
    var eventId = Number(req.params.id);

    if (!eventId) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    // 1. kiểm tra event tồn tại
    var event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 2. trạng thái hợp lệ
    if (event.status !== "UPCOMING" && event.status !== "ONGOING") {
      return res
        .status(400)
        .json({ message: "Event is not open for joining" });
    }

    // 3. đã tham gia chưa
    var joined = await prisma.join.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    if (joined) {
      return res.status(400).json({ message: "Already joined" });
    }

    // 4. full slot
    if (
      event.maxVolunteers > 0 &&
      event.currentParticipants >= event.maxVolunteers
    ) {
      return res.status(400).json({ message: "Event is full" });
    }

    // 5. TẠO JOIN
    await prisma.join.create({
      data: {
        userId: userId,
        eventId: eventId
      }
    });

    // 6. tăng số lượng
    await prisma.event.update({
      where: { id: eventId },
      data: {
        currentParticipants: {
          increment: 1
        }
      }
    });

    res.json({ message: "Join event successfully" });
  } catch (err) {
    console.error("joinEvent error:", err);
    res.status(500).json({ message: "Join event failed" });
  }
};
