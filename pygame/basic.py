import pygame

pygame.init()
screen = pygame.display.set_mode((800, 600))
clock = pygame.time.Clock()
running = True

crane_size = 40
crane_pos = pygame.Vector2(screen.get_width() / 2, screen.get_height() / 2)

while running:

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    screen.fill("purple")

    pygame.draw.rect(screen, "black", (crane_pos.x - crane_size / 2, crane_pos.y - crane_size/2, crane_size, crane_size))

    pygame.display.flip()

    clock.tick(60)


pygame.quit()